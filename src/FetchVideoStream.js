const fetchVideoStream = async (
  localStream,
  remoteStream,
  pc,
  webcamVideoRef,
  remoteVideoRef,
  setCallButton,
  setAnswerButton,
  setWebcamButton
) => {
  //Setting up the media sources

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

  webcamVideoRef.current.srcObject = localStream;
  remoteVideoRef.current.srcObject = remoteStream;

  setCallButton(false);
  setAnswerButton(false);
  setWebcamButton(true);
};
export default fetchVideoStream;
