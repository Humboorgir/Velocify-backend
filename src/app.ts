// loading environment variables
import { config } from "dotenv";
config();

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
const port = process.env.PORT || 2000;
const app: Express = express();
const server = createServer(app);
const database = mongoose.connection;

// handling database errors
loadMongoEvents(database);

// establish connection with mongodb database
mongoConnect();

// initialize socket.io
const io = new Server(server);
io.on("connection", () => {
  console.log("someone connected");
});

// cors
const corsOptions: CorsOptions = {
  origin: FRONTEND_SERVER,
};
app.use(cors(corsOptions));
// use body parser middleware to parse json data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// loading routes
loadRouteFiles(app);

// return 404 if none of the defined routes match the url
app.use((req: Request, res: Response) => {
  return res.status(404).send("Not found");
});

server.listen(port, () => {
  console.log(`${chalk.cyan("[Server]:")} server running on port ${port}`);
});
