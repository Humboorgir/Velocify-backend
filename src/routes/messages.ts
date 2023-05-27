import express, { Request, Response } from "express";
import authenticate from "../utils/authenticateToken";
// test data
const messages = [
  {
    author: "Person 1",
    content: "Hello there!",
  },
  {
    author: "Person 2",
    content: "Hi",
  },
  {
    author: "Person 1",
    content: "What's up?",
  },
  {
    author: "Person 2",
    content: "Nothing much",
  },
  {
    author: "Person 1",
    content: "You doing good?",
  },
  {
    author: "Person 2",
    content: "Yeah... atleast for now",
  },
  {
    author: "Person 1",
    content: "Anything you wanna talk about?",
  },
  {
    author: "Person 2",
    content: "Nah im good bro",
  },
  {
    author: "Person 1",
    content: "Alright",
  },
];

const router = express.Router();
router.get("/", authenticate, (req: Request, res: Response) => {
  console.log("message haro miferestam");
  return res.status(200).json(messages);
});
export default router;
