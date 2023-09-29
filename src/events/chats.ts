import { Server, Socket } from "socket.io";
import userModel from "../models/user";

export default async function handler(io: Server, socket: Socket, data: any, callback: (chats: any) => void) {
  const { decoded } = socket as any;
  const userId = decoded._id;
  if (userId != data) return console.log("User ids dont match");

  let user = (
    await userModel
      .find({
        _id: data,
      })
      .select("chats")
      .populate([
        {
          path: "chats",
          select: {
            participants: 1,
            messages: { $slice: -1 },
          },
          populate: {
            path: "participants",
            select: "username",
          },
        },
        {
          path: "chats.messages",
          select: "content",
        },
      ])
  )[0];

  if (!user) return console.log("User wasnt found");

  callback(user.chats);
}
