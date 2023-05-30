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
const conversationSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  messages: [
    {
      type: messageSchema,
    },
  ],
});

const conversationModel = mongoose.model("conversation", conversationSchema);
export default conversationModel;
