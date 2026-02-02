import express from "express";
import type { Response } from "express";
import Booking from "../models/Booking";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../types/AuthRequest";

const router = express.Router();

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { roomId, startTime, endTime } = req.body;
  const userId = req.user.id;

  const s = new Date(startTime);
  const e = new Date(endTime);
  const now = new Date();

  if (!roomId || !startTime || !endTime) {
    return res.status(400).json({ message: "roomId, startTime, endTime are required" });
  }

  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  if (s >= e) return res.status(400).json({ message: "start must be before end" });
  if (e <= now) return res.status(400).json({ message: "cannot book past" });

  // Check overlapping bookings
  const conflicting = await Booking.find({
    roomId,
    status: "active",
    startTime: { $lt: e },
    endTime: { $gt: s },
  });

  if (conflicting.length) {
    return res.status(409).json({
      conflict: true,
      message: "Room is already booked during this time",
      conflictingBookings: conflicting,
    });
  }

  const b = await Booking.create({
    roomId,
    userId,
    startTime: s,
    endTime: e,
    status: "active",
    createdAt: new Date(),
  });

  // broadcast via socket (optional)
  try {
    (req as any).io?.emit("booking-created", {
      bookingId: b._id,
      roomId,
      startTime: b.startTime,
      endTime: b.endTime,
      userId,
    });
  } catch {}

  return res.json(b);
});

router.patch("/:id/reschedule", authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const { startTime, endTime } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "not found" });

  if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "not owner" });
  }

  const s = new Date(startTime);
  const e = new Date(endTime);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  if (s >= e) return res.status(400).json({ message: "start must be before end" });

  const conflicting = await Booking.find({
    roomId: booking.roomId,
    status: "active",
    _id: { $ne: booking._id },
    startTime: { $lt: e },
    endTime: { $gt: s },
  });

  if (conflicting.length) {
    return res.status(409).json({
      conflict: true,
      message: "Room is already booked during this time",
      conflictingBookings: conflicting,
    });
  }

  booking.startTime = s;
  booking.endTime = e;
  await booking.save();

  try {
    (req as any).io?.emit("booking-rescheduled", {
      bookingId: booking._id,
      roomId: booking.roomId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
    });
  } catch {}

  return res.json(booking);
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .populate("roomId")
    .sort({ startTime: 1 });

  return res.json(bookings);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "not found" });

  if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "not owner" });
  }

  booking.status = "cancelled";
  await booking.save();

  try {
    (req as any).io?.emit("booking-cancelled", {
      bookingId: booking._id,
      roomId: booking.roomId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
    });
  } catch {}

  return res.json({ ok: true });
});

export default router;
