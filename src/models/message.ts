import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;
