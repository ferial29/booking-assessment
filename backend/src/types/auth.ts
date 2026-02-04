export type AuthUser = {
  id: string;
  role: "admin" | "user";
  email?: string;
  name?: string;
};
