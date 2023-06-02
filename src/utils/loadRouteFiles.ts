import * as path from "path";
import * as fs from "fs";
import { Express } from "express";

export default function loadRouteFiles(app: Express) {
  const routesPath = path.join(__dirname, "..", "routes");
  const routeFiles = fs.readdirSync(routesPath);
  for (const route of routeFiles) {
    // Removes the ".ts" at the end of the filenames.
    const Route: string = route.split(".")[0];
    console.log(Route);
    // .default is neccessary here when using esm modules.
    app.use(`/${Route}`, require(`../routes/${Route}`).default);
  }
}
