import mongoose from 'mongoose';
export interface IBooking {
  roomId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'cancelled';
  createdAt: Date;
}
const BookingSchema = new mongoose.Schema<IBooking>({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['active','cancelled'], default: 'active' },
  createdAt: { type: Date, default: () => new Date() }
});
BookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 });
export default mongoose.model<IBooking & mongoose.Document>('Booking', BookingSchema);
