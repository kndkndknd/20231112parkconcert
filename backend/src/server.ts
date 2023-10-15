import { Server } from "socket.io";
import express from "express";
import Http from "http";

const app = express();

const port = 8088;
const httpserver = Http.createServer(app).listen(port);

const io = new Server(httpserver, {
  path: "/socket.io",
});

io.sockets.on("connection", (socket) => {
  socket.on("test", () => {
    console.log("test");
    socket.broadcast.emit("test", "test");
  });
  socket.on("message", (message) => {
    console.log(message);
    socket.broadcast.emit("message", message);
  });
  socket.on("enter", (roomName) => {
    socket.join(roomName);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected");
  });
});
