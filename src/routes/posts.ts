import { Router, Request, Response } from "express";
const router = Router();
import authenticate from "../utils/authenticateToken";
const posts = [
  {
    username: "hamburger",
    title: "post 1",
  },
  {
    username: "noobesag",
    title: "post 2",
  },
];
router.get("/", authenticate, (req: Request, res: Response) => {
  return res.json(posts);
});
export default router;
