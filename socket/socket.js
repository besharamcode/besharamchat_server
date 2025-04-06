import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://chat.besharamcode.in"],
    Credential: true,
  },
});

export const usersSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected with socket id: " + socket.id);
  const { userId } = socket.handshake.query;
  usersSocketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log("User disconnected with socket id: " + socket.id);
    delete usersSocketMap[userId];
  });
});
