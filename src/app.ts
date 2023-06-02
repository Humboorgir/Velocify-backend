// loading environment variables
import { config } from "dotenv";
config();

import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";

import express, { Request, Response, Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import mongoose from "mongoose";

import mongoConnect from "./utils/mongoconnect";
import loadMongoEvents from "./utils/mongoEvents";
import loadRouteFiles from "./utils/loadRouteFiles";

const FRONTEND_SERVER = process.env.FRONTEND_SERVER || "http://localhost:3000";
const PORT = Number(process.env.PORT) || 2000;
const IP_ADDRESS = process.env.IP_ADDRESS;
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

io.on("connection", async (socket) => {
  // get the path to ./events in my computer
  const eventsPath = path.join(__dirname, "events");
  // get the name of each file stored in ./events (along with their file extensions)
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => !file.endsWith(".map"));

  for (const event of eventFiles) {
    // remove file extensions
    const Event: string = event.split(".")[0];
    // import handler
    const handler = require(`./events/${Event}`);
    socket.on(Event, (data) => handler.default(io, socket, data));
  }
});

// return 404 if none of the defined routes match the url
app.use((req: Request, res: Response) => {
  return res.sendStatus(404);
});

server.listen(PORT, IP_ADDRESS, () => {
  console.log(
    `${chalk.cyan("[Server]:")} server running on ${IP_ADDRESS}:${PORT}`
  );
});
