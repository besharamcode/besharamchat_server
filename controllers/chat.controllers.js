import mongoose from "mongoose";
import { Chat } from "../models/Chat.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { io, usersSocketMap } from "../socket/socket.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { message, chatId } = req.body;
  const { senderId } = req.params;
  if (message.length < 1) {
    throw new ApiError(400, "Please enter valid message!");
  } else {
    await Message.create({
      senderId,
      chatId,
      message,
    });
    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat not found!");
    const reciverId = chat.members.find(
      (member) => member.toString() !== senderId
    );
    io.to(usersSocketMap[reciverId]).emit("getMessage", {
      sender: false,
      message,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { message, sender: true }, "Message Sent!"));
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  if (chatId.length < 1) {
    throw new ApiError(400, "Please enter valid chatId!");
  }

  // Aggregate pipeline to fetch messages
  const messages = await Message.aggregate([
    {
      $match: {
        chatId: new mongoose.Types.ObjectId(chatId),
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $addFields: {
        sender: {
          $eq: ["$senderId", new mongoose.Types.ObjectId(req.user)], // Check if senderId matches userId
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $project: {
        message: 1,
        _id: 0,
        sender: 1,
      },
    },
  ]);

  if (messages.length < 1) {
    return res
      .status(200)
      .json(new ApiResponse(200, { messages }, "Messages fetched!"));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, { messages }, "Messages fetched!"));
  }
});

export const getChats = asyncHandler(async (req, res) => {
  // Aggregate pipeline to fetch user's chats
  const usersChats = await Chat.aggregate([
    {
      $match: {
        members: new mongoose.Types.ObjectId(req.user),
      },
    },
    {
      $lookup: {
        from: "messages", // Collection name of your messages
        let: { chatId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$chatId", "$$chatId"] },
            },
          },
          {
            $sort: { createdAt: -1 }, // Sort messages in descending order of createdAt to get the latest one
          },
          {
            $limit: 1, // Limit to retrieve only the latest message
          },
          {
            $project: {
              _id: 0,
              message: 1,
              senderId: 1,
            },
          },
        ],
        as: "latestMessage",
      },
    },
  ]);
  // Additional processing to add avatar and last message to each chat
  const processedChats = await Promise.all(
    usersChats.map(async (chat) => {
      const chatMembers = await User.find(
        { _id: { $in: chat.members } },
        { avatar: 1, fullname: 1, username: 1 }
      ); // Fetch avatars of chat members
      const lastMessage =
        chat.latestMessage.length > 0 ? chat.latestMessage[0] : null; // Get last message, if any

      return {
        chatId: chat._id,
        isGroup: chat.group,
        avatar: chat.group
          ? chat.avatar
          : chatMembers.find((member) => member._id.toString() !== req.user)
              ?.avatar,
        fullname: chatMembers.find(
          (member) => member._id.toString() !== req.user
        )?.fullname,
        username: chatMembers.find(
          (member) => member._id.toString() !== req.user
        )?.username,
        groupName: chat.group ? chat.groupName : null,
        lastMessage: lastMessage
          ? {
              message: lastMessage.message,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { chats: processedChats },
        "Chats fetched successfully!"
      )
    );
});

export const getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  if (chatId.length < 1) {
    throw new ApiError(400, "Please enter valid chatId!");
  }

  const userChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    {
      $lookup: {
        from: "messages", // Collection name of your messages
        let: { chatId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$chatId", "$$chatId"] },
            },
          },
          {
            $sort: { createdAt: -1 }, // Sort messages in descending order of createdAt to get the latest one
          },
          {
            $limit: 1, // Limit to retrieve only the latest message
          },
          {
            $project: {
              _id: 0,
              message: 1,
              senderId: 1,
            },
          },
        ],
        as: "latestMessage",
      },
    },
  ]);

  if (userChat.length < 1) {
    throw new ApiError(404, "Chat not found!");
  }

  // Additional processing to add avatar and last message to each chat
  const processedChat = await Promise.all(
    userChat.map(async (chat) => {
      const chatMembers = await User.find(
        { _id: { $in: chat.members } },
        { avatar: 1, fullname: 1, username: 1 }
      ); // Fetch avatars of chat members
      const lastMessage =
        chat.latestMessage.length > 0 ? chat.latestMessage[0] : null; // Get last message, if any

      return {
        chatId: chat._id,
        isGroup: chat.group,
        avatar: chat.group
          ? chat.avatar
          : chatMembers.find((member) => member._id.toString() !== req.user)
              ?.avatar,
        fullname: chatMembers.find(
          (member) => member._id.toString() !== req.user
        )?.fullname,
        username: chatMembers.find(
          (member) => member._id.toString() !== req.user
        )?.username,
        groupName: chat.group ? chat.groupName : null,
        lastMessage: lastMessage
          ? {
              message: lastMessage.message,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { chat: processedChat[0] },
        "Chat fetched successfully!"
      )
    );
});
