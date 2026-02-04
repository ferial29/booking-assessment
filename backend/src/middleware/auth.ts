import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type JwtUserPayload = {
  id: string;
  role: "user" | "admin";
  email?: string;
};

export type AuthRequest = Request & {
  user?: JwtUserPayload;
};

function getTokenFromHeader(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2) return null;

  const [type, token] = parts;
  if (type !== "Bearer" || !token) return null;

  return token;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "Missing auth token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "JWT_SECRET is not set" });

    const decoded = jwt.verify(token, secret) as JwtUserPayload;

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function roleMiddleware(roles: Array<JwtUserPayload["role"]>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

export const auth = authMiddleware;
export const requireRole = (role: JwtUserPayload["role"]) => roleMiddleware([role]);
