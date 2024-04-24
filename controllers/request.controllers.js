import { Chat } from "../models/Chat.model.js";
import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js";
import { io, usersSocketMap } from "../socket/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ receiverId: req.user });
  const sendersId = requests.map((request) => request.senderId);
  if (requests.length < 1) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { requests }, "Requests fetched successfully!")
      );
  } else {
    const users = await User.find({ _id: { $in: sendersId } }).select(
      "_id avatar fullname username"
    );
    const request = requests.map((request) => {
      const user = users.find(
        (user) => user._id.toString() === request.senderId.toString()
      );
      return {
        _id: request._id,
        senderId: request.senderId,
        avatar: user.avatar,
        fullname: user.fullname,
        username: user.username,
        status: request.status,
      };
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { request }, "Requests fetched successfully!")
      );
  }
});

export const sendRequest = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  if (friendId.length < 1)
    throw new ApiError(400, "Please enter valid friendId!");
  else {
    const user = await User.findById(friendId);
    if (!user) throw new ApiError(404, "User not found!");
    else {
      const request = await Request.create({
        senderId: req.user,
        receiverId: friendId,
      });
      const requestData = {
        _id: request._id,
        senderId: request.senderId,
        avatar: user.avatar,
        fullname: user.fullname,
        username: user.username,
        status: request.status,
      };
      io.to(usersSocketMap[friendId]).emit("request", requestData);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Request Sent Successfully!"));
    }
  }
});

export const cancleRequest = asyncHandler(async (req, res) => {
  const { recieverId } = req.query;

  if (recieverId.length < 1)
    throw new ApiError(400, "Please enter valid requestId!");
  else {
    const request = await Request.findOne({
      sender: req.user,
      receiver: recieverId,
    });
    if (!request) throw new ApiError(404, "Request not found!");
    else {
      await Request.findByIdAndDelete(request._id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Request Canceled Successfully!"));
    }
  }
});

export const acceptOrRejectRequest = asyncHandler(async (req, res) => {
  const { requestId, action } = req.body;
  if (requestId.length < 1)
    throw new ApiError(400, "Please enter valid requestId!");
  else {
    const request = await Request.findById(requestId);
    if (!request) throw new ApiError(404, "Request not found!");
    else {
      if (action === "reject") {
        await Request.findByIdAndDelete(requestId);
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Request rejected Successfully!"));
      }
      if (action === "accept") {
        await Request.findByIdAndDelete(requestId);
        await Chat.create({
          members: [request.senderId, request.receiverId],
        });
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Request accepted Successfully!"));
      } else {
        throw new ApiError(400, "Please enter valid action!");
      }
    }
  }
});
