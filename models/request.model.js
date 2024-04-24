import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const requestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

requestSchema.plugin(mongoosePaginate);

export const Request = mongoose.model("Request", requestSchema);
