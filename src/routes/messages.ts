import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
import conversationModel from "../models/conversation";

const router = express.Router();
// temporarily removing authentication middleware for testing purposes.
router.get("/", authenticate, async (req: Request, res: Response) => {
  const messages = await conversationModel
    .find({ public: true })
    .populate("author", "username");
  return res.status(200).json(messages);
});
export default router;
