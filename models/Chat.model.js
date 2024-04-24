import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ChatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    groupName: {
      type: String,
      trim: true,
    },
    group: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

ChatSchema.plugin(mongoosePaginate);

export const Chat = mongoose.model("Chat", ChatSchema);
