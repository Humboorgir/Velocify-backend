import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
import conversationModel from "../models/conversation";
import { JwtPayload } from "jsonwebtoken";
const router = express.Router();

interface authenticatedRequest extends Request {
  user: JwtPayload;
}
router.get("/:userId", authenticate, async (req: Request, res: Response) => {
  const { userId } = req.params;
  const authenticatedRequest = req as authenticatedRequest;
  const myId = authenticatedRequest.user._id;
  let conversation = await conversationModel.findOne({
    users: { $all: [userId, myId] },
  });
  //   .populate("users", "username")
  //   .populate("messages")
  //   .populate({ path: "messages/authors", select: "username" });
  if (!conversation) conversation = null;
  return res.status(200).json(conversation);
});
export default router;
