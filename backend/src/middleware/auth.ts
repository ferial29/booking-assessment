import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types/AuthRequest";

type JwtPayload = {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
};

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = { id: decoded.id, role: decoded.role || "user" };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function roleMiddleware(requiredRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
