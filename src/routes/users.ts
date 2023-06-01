import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
import userModel from "../models/user";

const router = express.Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const users = await userModel.find({}).select("-email -password");
  return res.status(200).json(users);
});
export default router;
