import "dotenv/config";
import express from "express";
import cors from "cors";
import { dbConnect } from "../helper/db.js";
import path from "path";
import { fileURLToPath } from "url";

// importing routes
import authRoute from "../routes/auth.route.js";
import requestRoute from "../routes/request.route.js";
import chatRoute from "../routes/chat.route.js";
import { app, httpServer } from "../socket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8000;

const corsOptions = {
  origin: ["http://localhost:5173","https://chat.besharamcode.in"],
  Credential: true,
};

const staticPath = path.join(__dirname, "../public");

app
  .use(cors(corsOptions))
  .use(express.json({ limit: "16kb" }))
  .use(express.urlencoded({ extended: true }))
  .use(express.static(staticPath))
  .use("/images/:imagename", express.static("/images"))
  .use("/chatapi/auth", authRoute)
  .use("/chatapi/request", requestRoute)
  .use("/chatapi/chat", chatRoute);

app.get("/", (req, res) => {
  res.json("Welcome from Besharam Chat");
});

httpServer.listen(port, () => {
  try {
    dbConnect().catch((err) => console.log(err));
    console.log(`Besharam chat server listing on port: ${port}`);
  } catch (error) {
    console.log(error);
  }
});
