import { Request } from "express";

export type AuthUser = {
  id: string;
  role: "user" | "admin";
};

export type AuthRequest = Request & {
  user: AuthUser;
  io?: any;
};
