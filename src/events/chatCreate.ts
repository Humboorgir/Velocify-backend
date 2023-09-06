// IMPORTANT NOTE!!!!
// its pretty late right now and i can barely read this
// im not expecting the code below to work properly,
// long story short make sure to check everything line by line again tommorow to make sure
// everything works as expected

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import chatModel from "../models/chat";
interface IData {
  token: string;
  userId: string;
}
interface IO extends Server {
  IDs: Map<string, string>;
}

interface chat {
  _id: string;
  participants: any[];
}
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";

export default async function handler(io: IO, socket: Socket, data: IData, callback: (chat: chat) => void) {
  // note: userId contains the ID of the user we're adding
  const { userId } = data;
  const { decoded } = socket as any;
  const user = await userModel.findOne({ _id: decoded._id });
  const otherUser = await userModel.findOne({ _id: userId });
  if (!user) return console.log("request senders account wasnt found");
  if (!otherUser) return console.log("other users account wasnt found");
  const chat = new chatModel({
    participants: [user._id, otherUser._id],
    messages: [],
  });
  const savedChat = await chat.save();
  (user.chats as any[]).push(chat._id);
  user.save();

  callback({
    _id: savedChat._id,
    participants: [
      {
        _id: user._id,
        username: user.username,
      },
      {
        _id: otherUser._id,
        username: otherUser.username,
      },
    ],
  });
}
