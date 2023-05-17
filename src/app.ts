import express, { Request, Response } from "express";
const port = 8080;

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("test");
});

app.listen(port, () => {
  console.log("server running");
});
