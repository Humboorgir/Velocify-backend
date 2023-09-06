import { Server, Socket } from "socket.io";
import chatModel from "../models/chat";

export default async function handler(io: Server, socket: Socket, data: any, callback: (chats: any) => void) {
  const chatId = data;
  let chat = await chatModel
    .findOne({
      _id: chatId,
    })
    .populate("participants", "username")
    .populate({
      path: "messages.author",
      select: "-email -password",
    });
  if (!chat) chat = null;
  callback(chat);
}
