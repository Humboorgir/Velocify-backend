import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
import messageModel from "../models/message";

const router = express.Router();
router.get("/", authenticate, async (req: Request, res: Response) => {
  const messages = await messageModel.find({}).populate("author", "username");
  return res.status(200).json(messages);
});
export default router;
