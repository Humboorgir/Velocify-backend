import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/user";
import jwt, { Secret } from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "rsecret";
const router = express.Router();
// TODO: implment this using a database
let refreshTokens: string[] = [];
// handling post requests sent to /auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
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
});

// used for generating a new access token
router.post("/token", (req: Request, res: Response) => {
  let { token } = req.body;
  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  return jwt.verify(
    token,
    REFRESH_TOKEN_SECRET as Secret,
    (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      const { email, password } = user;
      let accessToken = jwt.sign({ email, password }, ACCESS_TOKEN_SECRET);
      return res.json({ accessToken });
    }
  );
});
router.delete("/logout", (req: Request, res: Response) => {
  let { token } = req.body;
  refreshTokens = refreshTokens.filter((rtoken) => rtoken !== token);
  res.sendStatus(204);
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = { email, password };
  // check if user exists
  let foundUser = await userModel.findOne({ email });
  if (!foundUser) return res.sendStatus(404);
  // check if the password is valid
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) return res.sendStatus(401);
  let accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  let refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return res.status(200).json({ accessToken, refreshToken });
});

export default router;
