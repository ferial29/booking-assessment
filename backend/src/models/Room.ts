import mongoose from 'mongoose';
export interface IRoom {
  name: string;
  capacity: number;
}
const RoomSchema = new mongoose.Schema<IRoom>({ name: String, capacity: Number });
export default mongoose.model<IRoom & mongoose.Document>('Room', RoomSchema);
