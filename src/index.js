import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import firebase from "firebase/app";

firebase.initializeApp({
  apiKey: "AIzaSyBFossw0q8WMYjjC9iq8kLiadpEMblzbsA",
  authDomain: "webrtc-chat-room.firebaseapp.com",
  projectId: "webrtc-chat-room",
  storageBucket: "webrtc-chat-room.appspot.com",
  messagingSenderId: "1082970144288",
  appId: "1:1082970144288:web:8cca73182fd3b76e490645",
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
