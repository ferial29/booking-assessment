import mongoose from 'mongoose';
export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
}
const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });
export default mongoose.model<IUser & mongoose.Document>('User', UserSchema);
