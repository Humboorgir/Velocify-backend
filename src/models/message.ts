import mongoose from "mongoose";
interface IMessage {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
}
const messageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  content: String,
});
const messageModel = mongoose.model<IMessage>("message", messageSchema);
export default messageModel;
