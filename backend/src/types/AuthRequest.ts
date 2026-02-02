import type { Request } from "express";

export interface AuthUser {
  id: string;
  role: "admin" | "user" | string;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}
