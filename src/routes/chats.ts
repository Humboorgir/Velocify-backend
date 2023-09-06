import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
import userModel from "../models/user";

const router = express.Router();

router.get("/:userId", authenticate, async (req: Request, res: Response) => {
  const { userId } = req.params;
  let user = (
    await userModel
      .find({
        _id: userId,
      })
      .select("chats")
      .populate({
        path: "chats",
        select: "participants",
        populate: {
          path: "participants",
          select: "username",
        },
      })
  )[0];
  if (!user) {
    res.sendStatus(404);
  }

  if (String(userId) !== (req as any).user._id) return res.sendStatus(403);

  return res.status(200).json(user.chats);
});
export default router;
