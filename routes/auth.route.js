import express from "express";
import { errorHandler } from "../utils/errorHandler.js";
import { authUser, verifyUser } from "../middlewares/authUser.js";
import {
  deleteAccount,
  fetchUser,
  forgotPassword,
  login,
  logout,
  register,
  searchUser,
  signup,
  someUsers,
  verify,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.route("/fetchuser").get(authUser, fetchUser);

router.route("/signup").post(signup);

router.route("/verify").post(verifyUser, verify);

router.route("/register").post(authUser, register);

router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/forgotpassword").post(forgotPassword);

router.route("/deleteaccount").delete(deleteAccount);

router.route("/searchuser").get(authUser, searchUser);

router.route("/someusers").get(authUser, someUsers);

router.use(errorHandler);

export default router;
