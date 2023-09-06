// loading environment variables
import { config } from "dotenv";
config();

import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

interface authenticatedRequest extends Request {
  user: JwtPayload | string;
}

const { log } = console;

export default function authenticateToken(req: Request, res: Response, next: NextFunction): any {
  log("starting authentication");
  // get the authorization header
  const authHeader = req.headers["authorization"];
  // remove 'Bearer' from the authorization header
  // the authorization header consists of two parts: Bearer and the token
  const token = authHeader?.split(" ")[1];
  // if there's no token return 403
  if (!token) {
    log("no token");
    return res.sendStatus(403);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, (err, user) => {
    // if the token is expired or invalid return 401
    if (err || !user) {
      log("invalid user");
      return res.sendStatus(401);
    }

    const authenticatedReq = req as authenticatedRequest;
    authenticatedReq.user = user;
    log("Valid token");
    return next();
  });
}
