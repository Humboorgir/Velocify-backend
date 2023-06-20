import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import messageModel from "../models/message";
import conversationModel from "../models/conversation";
import { Document } from "mongoose";
interface IData {
  token: string;
  message: string;
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
  console.log(io.IDs);
  // note: userId contains the ID of the user we're sending a message to
  const { token, message, userId } = data;
  // authorize the user
  if (!token) return;
  try {
    // decode the token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    // if the token is expired or invalid:
    if (typeof decoded === "string") return;
    // look for a user in the database whose id matches the sender's id
    const author = await userModel
      .findOne({ _id: decoded._id })
      .select("-email -password");

    if (!author) return console.log("no author? 🤔");
    // save the message in its own collection
    let messageData = new messageModel({
      author: author._id,
      content: message,
    });
    const savedMessage = await messageData.save();
    // save a reference to the message in the conversation document
    const conversation = await conversationModel.findOne({
      users: { $all: [userId, decoded._id] },
    });
    if (!conversation) {
      const conversationData = new conversationModel({
        users: [userId, decoded._id],
        messages: [savedMessage._id],
      });
      conversationData.save();
    } else {
      conversation.messages.push(savedMessage._id);
      conversation.save();
    }
    const socketId = io.IDs.get(userId);
    if (!socketId) {
      return callback({
        author: author,
        content: message,
      });
    }

    socket.to(socketId).emit("messageCreate", {
      author: author,
      content: message,
    });
    callback({
      author: author,
      content: message,
    });
  } catch {
    // if the token is invalid or expired
    return;
  }
}
