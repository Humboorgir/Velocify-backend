import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import chatModel from "../models/chat";
import { Document } from "mongoose";
interface IData {
  token: string;
  message: string;
  chatId: string;
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
  const { token, message, chatId } = data;
  // authorize the user
  if (!token) return;
  try {
    // decode the token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    // if the token is expired or invalid:
    if (typeof decoded === "string") return;
    // check if a chat document between the two users is already stored,
    // if not, create one
    const chat = await chatModel
      .findOne({
        _id: chatId,
      })
      .populate({
        path: "participants",
        select: "-email -password",
      });

    if (!chat) return console.log("Chat doesn't exist");

    const author = chat.participants.filter((p) => p._id == decoded._id)[0];
    const recipient = chat.participants.filter((p) => p._id != decoded._id)[0];

    if (!recipient.chats.includes(chat._id as any)) {
      recipient.chats.push(chat._id as any);
      await recipient.save();
      const socketId = io.IDs.get(String(recipient._id));
      if (socketId) {
        socket.to(socketId).emit("chatCreate", {
          _id: chat._id,
          participants: [
            {
              _id: author._id,
              username: author.username,
            },
            {
              _id: recipient._id,
              username: recipient.username,
            },
          ],
        });
      }
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

    const socketId = io.IDs.get(String(recipient._id));

    if (socketId) {
      socket.to(socketId).emit("messageCreate", {
        author: author,
        content: message,
      });
    }

    callback({
      author: author as any,
      content: message,
    });
  } catch {
    // if the token is invalid or expired
    return;
  }
}
