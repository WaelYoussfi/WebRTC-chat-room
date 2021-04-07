import "firebase/firestore";
import firebase from "firebase";
import { useRef, useState } from "react";
firebase.initializeApp({
  apiKey: "AIzaSyBFossw0q8WMYjjC9iq8kLiadpEMblzbsA",
  authDomain: "webrtc-chat-room.firebaseapp.com",
  projectId: "webrtc-chat-room",
  storageBucket: "webrtc-chat-room.appspot.com",
  messagingSenderId: "1082970144288",
  appId: "1:1082970144288:web:8cca73182fd3b76e490645",
});

const fireStore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const ChatRoom = () => {
  const [callButton, setCallButton] = useState(true);
  const [answerButton, setAnswerButton] = useState(true);
  const [webcamButton, setWebcamButton] = useState(false);
  const [hangupButton, setHangupButton] = useState(true);

  const remoteVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);
  // const callInputRef = useRef("");

  const [callInput, setCallInput] = useState("");

  //Setting up the media sources

  const handleWebcamClick = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    remoteStream = new MediaStream();

    //pushing tracks from the local stream to the peer connection pc
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Pulling tracks from remote stream then adding them to the video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    //this.webcamVideo.srcObject = localStream;
    // setWebcamVideo(localStream);
    webcamVideoRef.current.srcObject = localStream;

    // this.remoteVideo.srcObject = remoteStream;
    // setRemoteVideo(remoteStream);
    remoteVideoRef.current.srcObject = remoteStream;

    setCallButton(false);
    setAnswerButton(false);
    setWebcamButton(true);
  };

  //Creating an offer of a video call

  const handleCallClick = async () => {
    // Reference Firestore collections for signaling
    const callDoc = fireStore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    setCallInput(callDoc.id);

    //Getting candidate(s) for the caller then save them to the database
    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Creating an offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    // Listening for a remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    setHangupButton(false);
  };

  const handleAnswerClick = async () => {
    const callId = callInput;
    console.log(callId);
    const callDoc = fireStore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  return (
    <div className="ChatRoom">
      <h2>We are in the ChatRoom</h2>
      <h2>1. Start your Webcam</h2>
      <div className="videos">
        <span>
          <h3>Local Stream</h3>
          <video ref={webcamVideoRef} autoPlay playsInline></video>
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video ref={remoteVideoRef} autoPlay playsInline></video>
        </span>
      </div>

      <button onClick={handleWebcamClick} disabled={webcamButton}>
        Start webcam
      </button>
      <h2>2. Create a new Call</h2>
      <button onClick={handleCallClick} disabled={callButton}>
        Create Call (offer)
      </button>

      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <input
        value={callInput}
        onChange={(event) => setCallInput(event.target.value)}
        // ref={callInputRef}
      />
      <button onClick={handleAnswerClick} disabled={answerButton}>
        Answer
      </button>

      <h2>4. Hangup</h2>

      <button disabled={hangupButton}>Hangup</button>
    </div>
  );
};

export default ChatRoom;
