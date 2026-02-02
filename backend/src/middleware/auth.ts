import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
  role: string;
};

export const authMiddleware: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_for_tests"
    ) as JwtPayload;

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const roleMiddleware = (role: "admin" | "user"): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
};
