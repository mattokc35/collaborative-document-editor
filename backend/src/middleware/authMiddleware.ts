import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
}

export interface UserRequest extends Request {
  userId?: number;
}

const authenticateToken = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid" });
    }
    const payload = user as JwtPayload;
    req.userId = payload.userId;
    next();
  });
};

export default authenticateToken;
