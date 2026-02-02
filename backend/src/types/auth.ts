export type AuthUser = {
  id: string;
  role: "user" | "admin";
  email?: string;
  name?: string;
};
