import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import Booking from '../models/Booking';
import Room from '../models/Room';
const router = express.Router();

router.get('/bookings', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const rooms = await Room.find({});
  const bookings = await Booking.find({}).populate('userId').sort({ startTime: 1 });
  const grouped = rooms.map(r => ({
    roomId: r._id,
    roomName: r.name,
    bookings: bookings.filter(b => b.roomId.toString() === r._id.toString())
  }));
  res.json(grouped);
});

export default router;
