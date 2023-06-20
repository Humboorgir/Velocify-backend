import mongoose, { ObjectId } from "mongoose";

interface IChat {
  participants: [ObjectId];
  messages: [
    {
      author: ObjectId;
      content: string;
    }
  ];
}
const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [messageSchema],
});

const chatModel = mongoose.model<IChat>("Chat", chatSchema);
export default chatModel;
