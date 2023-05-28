// loading environment variables
import { config } from "dotenv";
config();

import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";

import express, { Request, Response, Express } from "express";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import mongoose from "mongoose";

import mongoConnect from "./utils/mongoconnect";
import loadMongoEvents from "./utils/mongoEvents";

const FRONTEND_SERVER = process.env.FRONTEND_SERVER || "http://localhost:3000";
const port = process.env.PORT || 2000;
const app: Express = express();
const database = mongoose.connection;

// handling database errors
loadMongoEvents(database);

// establish connection with mongodb database
mongoConnect();

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
const routes: string[] = [];
const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
for (const route of routeFiles) {
  // Removes the ".ts" at the end of the filenames.
  const Route: string = `/${String(route).slice(0, -3)}`;
  routes.push(Route);
  // .default is neccessary here when using esm modules.
  app.use(Route, require(`./routes/${Route}`).default);
}
// return 404 if none of the defined routes match the url
app.use((req: Request, res: Response) => {
  return res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`${chalk.cyan("[Server]:")} server running on port ${port}`);
});
