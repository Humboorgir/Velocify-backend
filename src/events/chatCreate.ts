// IMPORTANT NOTE!!!!
// its pretty late right now and i can barely read this
// im not expecting the code below to work properly,
// long story short make sure to check everything line by line again tommorow to make sure
// everything works as expected

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import chatModel from "../models/chat";
import { Document } from "mongoose";
interface IData {
  token: string;
  userId: string;
}
interface IO extends Server {
  IDs: Map<string, string>;
}

interface message {
  author: Document;
  content: string;
}
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";

export default async function handler(
  io: IO,
  socket: Socket,
  data: IData,
  callback: (message: message) => void
) {
  // note: userId contains the ID of the user we're sending a message to
  const { token, userId } = data;
  // authorize the user
  if (!token) return;
  try {
    // decode the token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    // if the token is expired or invalid:
    if (typeof decoded === "string") return;
    const user = await userModel.findOne({ _id: decoded._id });
    const otherUser = await userModel.findOne({ _id: userId });
    if (!otherUser) return;
    if (!user) return;
    const chat = new chatModel({
      participants: [user._id, otherUser._id],
      messages: [],
    });
    chat.save();
    (user.chats as any[]).push(chat._id);
    user.save();
  } catch {
    // if the token is invalid or expired
    return;
  }
}
