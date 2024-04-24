import express from "express";
import { errorHandler } from "../utils/errorHandler.js";
import { authUser, verifyUser } from "../middlewares/authUser.js";
import {
  acceptOrRejectRequest,
  cancleRequest,
  getRequests,
  sendRequest,
} from "../controllers/request.controllers.js";

const router = express.Router();

router.route("/getrequests").get(authUser, getRequests);

router.route("/send").post(authUser, sendRequest);

router.route("/cancle").post(authUser, cancleRequest);

router.route("/acceptOrRejectRequest").put(authUser, acceptOrRejectRequest);

router.use(errorHandler);

export default router;
