import express from "express";
import { errorHandler } from "../utils/errorHandler.js";
import { authUser } from "../middlewares/authUser.js";
import { getChats, getMessages, sendMessage } from "../controllers/chat.controllers.js";

const router = express.Router();

router.route("/fetchchats").get(authUser, getChats);

router.route("/sendmessage/:senderId").post(authUser, sendMessage);

router.route("/getmessages/:chatId").get(authUser, getMessages);

router.use(errorHandler);

export default router;
