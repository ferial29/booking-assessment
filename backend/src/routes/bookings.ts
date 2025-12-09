import express from 'express';
import Booking from '../models/Booking';
import { authMiddleware } from '../middleware/auth';
import Room from '../models/Room';
import mongoose from 'mongoose';
const router = express.Router();

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

router.post("/", authMiddleware, async (req, res) => {
  const { roomId, startTime, endTime } = req.body;
  const userId = req.user.id;
  const s = new Date(startTime), e = new Date(endTime);
  const now = new Date();
  if (s >= e) return res.status(400).json({ message: 'start must be before end' });
  if (e <= now) return res.status(400).json({ message: 'cannot book past' });
  // check overlapping bookings for room
  const conflicting = await Booking.find({ roomId, status: 'active', $or: [
    { startTime: { $lt: e }, endTime: { $gt: s } }
  ]});
  if (conflicting.length) return res.status(409).json({ conflict:true, message:'Room is already booked during this time', conflictingBookings: conflicting });
  const b = await Booking.create({ roomId, userId, startTime: s, endTime: e, status: 'active', createdAt: new Date() });
  // broadcast via socket
  try { (req.io as any).emit('booking-created', { bookingId: b._id, roomId, startTime: b.startTime, endTime: b.endTime, userId }); } catch(e){}
  res.json(b);
});

router.patch('/:id/reschedule', authMiddleware, async (req: any, res) => {
  const id = req.params.id;
  const { startTime, endTime } = req.body;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'not found' });
  if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'not owner' });
  const s = new Date(startTime), e = new Date(endTime);
  if (s >= e) return res.status(400).json({ message: 'start must be before end' });
  const conflicting = await Booking.find({ roomId: booking.roomId, status: 'active', _id: { $ne: booking._id }, $or: [
    { startTime: { $lt: e }, endTime: { $gt: s } }
  ]});
  if (conflicting.length) return res.status(409).json({ conflict:true, message:'Room is already booked during this time', conflictingBookings: conflicting });
  booking.startTime = s; booking.endTime = e;
  await booking.save();
  try { (req.io as any).emit('booking-rescheduled', { bookingId: booking._id, roomId: booking.roomId, startTime: booking.startTime, endTime: booking.endTime, userId: booking.userId }); } catch(e){}
  res.json(booking);
});

router.get('/me', authMiddleware, async (req:any, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate('roomId').sort({ startTime: 1 });
  res.json(bookings);
});

router.delete('/:id', authMiddleware, async (req:any, res) => {
  const id = req.params.id;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'not found' });
  if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'not owner' });
  booking.status = 'cancelled';
  await booking.save();
  try { (req.io as any).emit('booking-cancelled', { bookingId: booking._id, roomId: booking.roomId, startTime: booking.startTime, endTime: booking.endTime, userId: booking.userId }); } catch(e){}
  res.json({ ok: true });
});

export default router;
