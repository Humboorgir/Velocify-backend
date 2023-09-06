import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/user";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "rsecret";
const router = express.Router();
// TODO: implement this using a database
let refreshTokens: string[] = [];
// handling post requests sent to /auth/register
router.post("/register", async (req: Request, res: Response) => {
  let { username, email, password } = req.body;
  if (!username || !email || !password) return;
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
  console.log("received req");
  let { refreshToken: token } = req.cookies;

  if (!token) {
    console.log("no ref token");
    return res.sendStatus(403);
  }
  if (!refreshTokens.includes(token)) {
    console.log("ref token not stored");
    return res.sendStatus(401);
  }

  try {
    // prettier-ignore
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET as Secret) as JwtPayload;
    const { email, password } = decoded;
    let accessToken = jwt.sign({ email, password }, ACCESS_TOKEN_SECRET);
    console.log(accessToken);
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.sendStatus(401);
  }
});
router.delete("/logout", (req: Request, res: Response) => {
  let { token } = req.body;
  refreshTokens = refreshTokens.filter((rtoken) => rtoken !== token);
  res.sendStatus(204);
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // check if user exists
  let foundUser = await userModel.findOne({ email });
  if (!foundUser) return res.sendStatus(404);
  // check if the password is valid
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) return res.sendStatus(401);

  const User = { _id: foundUser._id };
  // generating the access token
  let accessToken = jwt.sign(User, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  // generating the refresh token
  let refreshToken = jwt.sign(User, REFRESH_TOKEN_SECRET, {
    expiresIn: "90d",
  });
  // storing the refresh token
  refreshTokens.push(refreshToken);

  const user = { username: foundUser.username, _id: foundUser._id };
  return res.status(200).json({ accessToken, refreshToken, user });
});

export default router;
