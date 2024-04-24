import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.plugin(mongoosePaginate);

export const Message = mongoose.model("Message", messageSchema);
