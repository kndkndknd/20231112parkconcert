import { startVideo, stopVideo } from "./video";
import {
  connect,
  receiveOffer,
  receiveAnswer,
  receiveCandidate,
  hangup,
} from "./connect";

import { io } from "socket.io-client";
const socket = io();

const localVideo = <HTMLVideoElement>document.getElementById("localVideo");
const remoteVideo = <HTMLVideoElement>document.getElementById("remoteVideo");
let localStream: MediaStream;

document.getElementById("ready").onclick = async () => {
  localStream = await startVideo(localVideo);
};
document.getElementById("connect").onclick = async () => {
  await connect(localStream, remoteVideo);
};
document.getElementById("stopVideo").onclick = () => {
  stopVideo(localVideo);
};

document.getElementById("hangup").onclick = () => {
  hangup();
};

socket.on("connect", () => {
  const roomName = "default";
  socket.emit("enter", roomName);
});

socket.on("message", (data) => {
  console.log("message");
  if (data.type === "offer") {
    receiveOffer(data, localStream, remoteVideo);
  } else if (data.type === "answer") {
    receiveAnswer(data);
  } else if (data.type === "candidate") {
    receiveCandidate(data);
  } else if (data.type === "user dissconnected") {
    console.log("disconnected");
    stopVideo(localVideo);
    hangup();
  }
});
