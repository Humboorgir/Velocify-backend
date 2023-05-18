import express, { Request, Response } from "express";
import userModel from "../models/user";
import mongoConnect from "../utils/mongoconnect";
import jwt from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const router = express.Router();
// handling post requests sent to /auth/register
router.post("/register", (req: Request, res: Response) => {
  // for testing purposes:
  console.log("received a request!");
  console.table(req.body);
  const { username, email, password } = req.body;
  let data = new userModel({
    username,
    email,
    password,
  });
  mongoConnect();
  data.save();
  return res.status(200).json({
    ok: true,
  });
});
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = { email, password };
  jwt.sign(user, ACCESS_TOKEN_SECRET);
});

export default router;
