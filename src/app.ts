// loading environment variables
import { config } from "dotenv";
config();

import express, { Request, Response, Express } from "express";
import * as path from "path";
import * as fs from "fs";

const port = process.env.PORT || 2000;
const app: Express = express();
// use body parser middleware to parse json data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// loading routes
const routes: string[] = [];
const routesPath = path.join(__dirname, "routes");
const routeFiles = fs.readdirSync(routesPath);
console.log(routeFiles);
for (const route of routeFiles) {
  // Removes the ".ts" at the end of the filenames.
  const Route: string = `/${String(route).slice(0, -3)}`;
  routes.push(Route);
  // .default is neccessary here when using esm modules.
  app.use(Route, require(`./routes/${Route}`).default);
  console.log(routes);
}
// return 404 if none of the defined routes match the url
app.use((req: Request, res: Response) => {
  return res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log("server running");
});
