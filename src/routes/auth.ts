import express, { Request, Response } from "express";
import userModel from "../models/user";
import mongoConnect from "../utils/mongoconnect";
const router = express.Router();
router.all("/register", (req: Request, res: Response) => {
  // for testing purposes:
  console.log("received a request!");
  console.table(req.body);
  const { username, email, password } = req.body();
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

export default router;
