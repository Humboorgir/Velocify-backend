import express, { Request, Response } from "express";
import userModel from "../models/user";
import jwt, { Secret } from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "rsecret";
const router = express.Router();
// TODO: implment this using a database
let refreshTokens: string[] = [];
// handling post requests sent to /auth/register
router.post("/register", (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  let data = new userModel({
    username,
    email,
    password,
  });

  // saving the requested data into the databse
  data
    .save()
    .then(() => {
      return res.sendStatus(200);
    })
    .catch(() => {
      // the error will be emitted to mongoose.connection's "error" event
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
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = { email, password };
  let accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
  let refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken, refreshToken });
});

export default router;
