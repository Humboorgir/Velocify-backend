// loading environment variables
import { config } from "dotenv";
config();

import chalk from "chalk";
import jwt from "jsonwebtoken";

import express, { Request, Response, Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import mongoose from "mongoose";

import userModel from "./models/user";
import messageModel from "./models/message";
import mongoConnect from "./utils/mongoconnect";
import loadMongoEvents from "./utils/mongoEvents";
import loadRouteFiles from "./utils/loadRouteFiles";

const FRONTEND_SERVER = process.env.FRONTEND_SERVER || "http://localhost:3000";
const PORT = Number(process.env.PORT) || 2000;
const IP_ADDRESS = process.env.IP_ADDRESS;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const app: Express = express();
const server = createServer(app);
const database = mongoose.connection;

// cors
const corsOptions: CorsOptions = {
  origin: FRONTEND_SERVER,
};
app.use(cors(corsOptions));

// handling database errors
loadMongoEvents(database);

// establish connection with mongodb database
mongoConnect();

// use body parser middleware to parse json data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// loading routes
loadRouteFiles(app);

// initializing socket.io
const io = new Server(server, {
  cors: corsOptions,
});
io.on("connection", (socket) => {
  socket.on("messageCreate", async (data) => {
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
  });
});

// return 404 if none of the defined routes match the url
app.use((req: Request, res: Response) => {
  return res.status(404).send("Not found");
});

server.listen(PORT, IP_ADDRESS, () => {
  console.log(
    `${chalk.cyan("[Server]:")} server running on ${IP_ADDRESS}:${PORT}`
  );
});
