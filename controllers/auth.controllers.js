import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import jwt from "jsonwebtoken";
import {
  generateAccessAndRefreshToken,
  sendVerifyMail,
} from "../lib/libFunc.js";
import mongoose from "mongoose";
import { Chat } from "../models/Chat.model.js";

export const fetchUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found!");
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully!"));
});

export const someUsers = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user);

  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $nin: [userId],
        },
      },
    },
    {
      $lookup: {
        from: "requests", // Assuming the name of your request collection is "requests"
        let: { receiver: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$senderId", userId] },
                  { $eq: ["$receiverId", "$$receiver"] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: "sentRequests",
      },
    },
    {
      $addFields: {
        isSent: { $gt: [{ $size: "$sentRequests" }, 0] }, // Check if there are any sent requests
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        username: 1,
        avatar: 1,
        isSent: 1,
      },
    },
  ]);
  if (!users) throw new ApiError(404, "Users not found!");
  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "Users fetched successfully!"));
});

export const searchUser = asyncHandler(async (req, res) => {
  const { username } = req.query;
  const userId = new mongoose.Types.ObjectId(req.user);
  const userChatWith = await Chat.find({
    members: userId,
  });

  const friendsId = userChatWith
    .map((chat) => chat.members)
    .flat()
    .filter((member) => member.toString() !== userId);

  const users = await User.aggregate([
    {
      $match: {
        username: {
          $regex: username,
          $options: "i",
        },
        _id: {
          $nin: [...friendsId, userId],
        },
      },
    },
    {
      $lookup: {
        from: "requests", // Assuming the name of your request collection is "requests"
        let: { receiver: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$senderId", userId] },
                  { $eq: ["$receiverId", "$$receiver"] },
                ],
              },
            },
          },
        ],
        as: "sentRequests",
      },
    },
    {
      $addFields: {
        isSent: { $gt: [{ $size: "$sentRequests" }, 0] }, // Check if there are any sent requests
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        username: 1,
        avatar: 1,
      },
    },
  ]);
  if (users.length < 1) throw new ApiError(404, "User not found!");
  else {
    return res
      .status(200)
      .json(new ApiResponse(200, { users }, "User fetched successfully!"));
  }
});

export const signup = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const userName = await User.findOne({ username });
  const userEmail = await User.findOne({ email });
  if (userName)
    throw new ApiError(
      400,
      "Username Not available, Please choose another username!"
    );
  if (userEmail)
    throw new ApiError(400, "User already exists with this email!");
  if (fullname.length < 4 && username.length < 4 && email < 8 && password < 8)
    throw new ApiError(400, "Please enter valid credentials!");
  else {
    const user = await User.create({
      fullname,
      username,
      email,
      password,
    });
    const verifyToken = jwt.sign(
      { userId: user._id },
      process.env.VERIFY_TOKEN_KEY
    );
    const isSend = await sendVerifyMail(email, verifyToken);
    if (isSend) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "We send a confirmation mail on your email for verification!"
          )
        );
    } else {
      throw new ApiError(500, "Please try again later!");
    }
  }
});

export const verify = asyncHandler(async (req, res) => {
  if (req.query) {
    const { token } = req.query;
    const user = await User.findById(req.user);
    if (token) {
      if (user.verified) {
        throw new ApiError(400, "User already verified!");
      } else {
        user.verified = true;
        const { accessToken, refreshToken } =
          await generateAccessAndRefreshToken(user._id);
        await user.save();
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { accessToken, refreshToken },
              "Verification Successful!"
            )
          );
      }
    }
  }
});

export const register = asyncHandler(async (req, res) => {
  const { mobile, gender } = req.body;
  const user = await User.findById(req.user);
  if (!user) throw new ApiError(404, "User not found!");
  user.mobile = mobile;
  user.gender = gender;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Registration Successful!"));
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (username.length < 4 || password.length < 4) {
    throw new ApiError(400, "Please enter valid credentials!");
  }

  const isUser = await User.findOne({ username });

  if (!isUser) {
    throw new ApiError(404, "User not found!");
  } else {
    const isCorrectPassword = await isUser.isCorrectPassword(password);
    if (!isCorrectPassword)
      throw new ApiError(400, "Please enter valid credentials!");
    else {
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        isUser._id
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Login Successful!"
          )
        );
    }
  }
});

export const logout = asyncHandler(async (req, res) => {});

export const forgotPassword = asyncHandler(async (req, res) => {});

export const deleteAccount = asyncHandler(async (req, res) => {});
