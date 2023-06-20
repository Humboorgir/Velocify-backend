import mongoose, { ObjectId } from "mongoose";
interface IUser {
  username: string;
  email: string;
  password: string;
  chats: [ObjectId];
}
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
  },
  { timestamps: true }
);
const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
