import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import chatModel from "../models/chat";
import conversationModel from "../models/chat";
import { Document, ObjectId } from "mongoose";
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

    const recipient = await userModel
      .findOne({ _id: userId })
      .select("-email -password");
    if (!recipient) return console.log("no recipient? 🤔");
    // check if a chat document between the two users is already stored,
    // if not, create one
    let chat = await chatModel.findOne({
      participants: { $all: [userId, author._id] },
    });
    if (!chat) {
      chat = new chatModel({
        participants: [userId, author._id],
        messages: [],
      });
    }

    // define the message object
    interface IMessage {
      author: any;
      content: string;
    }
    const Message: IMessage = {
      author: author._id,
      content: message,
    };

    chat.messages.push(Message);
    await chat.save();

    if (!author.chats.includes(chat._id as any)) {
      author.chats.push(chat._id as any);
      await author.save();
    }

    if (!recipient.chats.includes(chat._id as any)) {
      recipient.chats.push(chat._id as any);
      await recipient.save();
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
