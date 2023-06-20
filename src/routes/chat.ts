import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
import chatModel from "../models/chat";
import { JwtPayload } from "jsonwebtoken";
const router = express.Router();

interface authenticatedRequest extends Request {
  user: JwtPayload;
}
router.get("/:userId", authenticate, async (req: Request, res: Response) => {
  const { userId } = req.params;
  const authenticatedRequest = req as authenticatedRequest;
  const myId = authenticatedRequest.user._id;
  let chat = await chatModel
    .findOne({
      participants: { $all: [userId, myId] },
    })
    .populate("participants", "username")
    .populate({
      path: "messages",
      populate: {
        path: "author",
        select: "-email -password",
      },
    });

  if (!chat) chat = null;
  return res.status(200).json(chat);
});
export default router;
