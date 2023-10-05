import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/user";
import jwt from "jsonwebtoken";
import { z } from "zod";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const router = express.Router();

const userSchema = z.object({
  username: z.string().min(3).max(16),
  email: z.string().min(3).max(320),
  password: z.string().min(8).max(24),
});

type User = z.infer<typeof userSchema>;

// handling post requests sent to /auth/register
router.post("/register", async (req: Request, res: Response) => {
  const props = { ...req.body };

  const user = userSchema.safeParse(props);
  if (!user.success) return res.status(400).send(user.error.issues[0].message);
  const { username, password, email } = user.data as User;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let data = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    // saving the requested data into the databse
    data
      .save()
      .then(() => {
        return res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        return res.sendStatus(500);
      });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(400);
  // check if user exists
  let foundUser = await userModel.findOne({ email });
  if (!foundUser) return res.sendStatus(404);
  // check if the password is valid
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) return res.sendStatus(401);

  const User = { _id: foundUser._id };
  // generating the access token
  let accessToken = jwt.sign(User, ACCESS_TOKEN_SECRET);

  const user = { username: foundUser.username, _id: foundUser._id };
  return res.status(200).json({ accessToken, user });
});

export default router;
