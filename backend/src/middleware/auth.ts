import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

/**
 * Auth middleware
 * - Reads Bearer token from Authorization header
 * - Verifies JWT
 * - Loads user from DB
 * - Attaches a plain user object to req.user
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Validate Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2) Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 3) Validate JWT secret
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not set" });
    }

    // 4) Verify token and extract payload
    const decoded = jwt.verify(token, secret) as { userId: string };

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 5) Load user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 6) Attach a plain object to req.user (NOT a mongoose document)
    // This avoids many TypeScript compatibility issues.
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
