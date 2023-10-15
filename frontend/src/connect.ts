import { io } from "socket.io-client";
const socket = io();

let peerStarted = false;
let peerConnection: RTCPeerConnection;

export const connect = (localStream, remoteVideo) => {
  if (!peerStarted) {
    peerStarted = true;
    peerConnection = prepareNewConnection(localStream, remoteVideo);
    peerConnection.createOffer(
      function (sessionDescription) {
        // in case of success
        peerConnection.setLocalDescription(sessionDescription);
        // sendSDP(sessionDescription);
        const sdpTextArea = <HTMLTextAreaElement>document.getElementById("SDP");
        sdpTextArea.value = JSON.stringify(sessionDescription);
        socket.emit("message", sessionDescription);
        console.log("Sending: SDP");
      },
      function () {
        // in case of error
        console.log("Create Offer failed");
      }
    );
  } else {
    console.log("peer already started");
  }
};

export const hangup = () => {
  console.log("hangup");
  peerStarted = false;
};

// onOffer、 Offerを受け取ってRemoteDescriptionをセットし、Answerを作成/送信する
export const receiveOffer = async (receiveData, localStream, remoteVideo) => {
  if (peerStarted) {
    console.log("peer already started");
    return;
  }
  if (peerConnection) {
    console.error("peerConnection alreay exist!");
    return;
  }
  peerConnection = prepareNewConnection(localStream, remoteVideo);
  peerConnection.setRemoteDescription(new RTCSessionDescription(receiveData));

  await peerConnection.createAnswer(
    function (sessionDescription) {
      // in case of success
      peerConnection.setLocalDescription(sessionDescription);
      console.log("Sending: SDP");
      console.log(sessionDescription);
      // sendSDP(sessionDescription);
      const sdpTextArea = <HTMLTextAreaElement>document.getElementById("SDP");
      sdpTextArea.value = JSON.stringify(sessionDescription);
      socket.emit("message", sessionDescription);
    },
    function () {
      // in case of error
      console.log("Create Answer failed");
    }
  );
};

// onAnswer、Answerを受け取ってRemoteDescriptionをセットする
export const receiveAnswer = async (receiveData) => {
  if (!peerStarted) {
    console.log("peer NOT started");
    return;
  }
  if (!peerConnection) {
    console.error("peerConnection NOT exist!");
    return;
  }
  peerConnection.setRemoteDescription(new RTCSessionDescription(receiveData));
};

// onCandidate
export const receiveCandidate = (receiveData) => {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: receiveData.sdpMLineIndex,
    sdpMid: receiveData.sdpMid,
    candidate: receiveData.candidate,
  });
  console.log("Received Candidate...");
  console.log(candidate);
  peerConnection.addIceCandidate(candidate);
};

// peerConnectionを作成する
const prepareNewConnection = (localStream, remoteVideo) => {
  let pc_config = { iceServers: [] };
  let peer = new RTCPeerConnection(pc_config);

  // send any ice candidates to the other peer
  peer.onicecandidate = (event) => {
    if (event.candidate) {
      const sendData = {
        type: "candidate",
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      };
      const iceTextArea = <HTMLTextAreaElement>document.getElementById("ICE");
      iceTextArea.value = JSON.stringify(sendData);
      socket.emit("message", sendData);
      // console.log(evt.candidate);
    } else {
      console.log("empty ice event");
    }
  };

  for (const track of localStream.getTracks()) {
    peer.addTrack(track, localStream);
  }
  // peer.addStream(localStream);

  // const remoteVideo = <HTMLVideoElement>document.getElementById("remoteVideo");
  peer.addEventListener(
    "track",
    (event: RTCTrackEvent) => {
      console.log("-- peer.onaddstream()");
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.play();
      remoteVideo.volume = 0;
    },
    false
  );

  return peer;
};
