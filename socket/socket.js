import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  origin: "https://chat.besharamcode.in",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true, // if you're using cookies or auth headers
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
