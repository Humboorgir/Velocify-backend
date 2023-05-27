// loading environment variables
import { config } from "dotenv";
config();

import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

interface authenticatedRequest extends Request {
  user: JwtPayload | string;
}

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, (err, user) => {
    if (err || !user) return res.sendStatus(403);

    const authenticatedReq = req as authenticatedRequest;
    authenticatedReq.user = user;
    return next();
  });
}
