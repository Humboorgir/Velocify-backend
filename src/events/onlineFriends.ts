import { Server, Socket } from "socket.io";
import userModel from "../models/user";
interface IO extends Server {
  IDs: Map<string, string>;
}

export default async function handler(io: IO, socket: Socket, data: any, callback: (chats: any) => void) {
  const { decoded } = socket as any;
  const userId = decoded._id;
  if (userId != data) return console.log("User ids dont match");

  //   'friends' refers to people who have interacted with the request sender atleast once (or the opposite)
  let friends = (
    await userModel
      .find({
        _id: data,
      })
      .select("chats")
      .populate({
        path: "chats",
        select: "participants",
        populate: {
          path: "participants",
          select: "_id",
        },
      })
  )[0].chats;

  let onlineFriends = friends.filter((chat: any) => {
    let friend = chat.participants.filter((p: any) => p._id != userId)[0];
    return io.IDs.get(String(friend._id));
  });

  socket.emit("onlineFriends", onlineFriends);
}
