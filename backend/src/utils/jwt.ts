import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'change_this_secret';
export function sign(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' });
}
export function verify(token: string) {
  return jwt.verify(token, SECRET);
}
