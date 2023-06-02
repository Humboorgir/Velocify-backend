import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import messageModel from "../models/message";

interface IData {
  token: string;
  message: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
export default async function handler(io: Server, socket: Socket, data: IData) {
  const { token, message } = data;
  // authorize the user
  if (!token) return;
  try {
    // decode the token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (typeof decoded === "string") return;
    const author = await userModel
      .findOne({ _id: decoded._id })
      .select("-email -password");
    if (!author) return console.log("no author? 🤔");
    let data = new messageModel({
      author: author._id,
      content: message,
    });
    data.save();
    io.emit("messageCreate", {
      author: author,
      content: message,
    });
  } catch {
    // if the token is invalid or expired
    return;
  }
}
