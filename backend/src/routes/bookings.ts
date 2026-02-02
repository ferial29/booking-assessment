import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import { auth } from "../middlewares/auth";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";

const router = Router();

/**
 * Utility: check time overlap
 * Overlap if: startA < endB AND endA > startB
 */
function hasOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * POST /bookings
 * Create a new booking (authenticated)
 * Body: { roomId, startTime, endTime }
 */
router.post("/", auth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { roomId, startTime, endTime } = req.body as {
      roomId: string;
      startTime: string;
      endTime: string;
    };

    // Basic validation
    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ message: "roomId, startTime, endTime are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid startTime/endTime" });
    }

    if (start >= end) {
      return res.status(400).json({ conflict: false, message: "startTime must be before endTime" });
    }

    if (start.getTime() < Date.now()) {
      return res.status(400).json({ conflict: false, message: "Booking in the past is not allowed" });
    }

    // Ensure room exists
    const room = await Room.findById(roomId).lean();
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Find conflicting bookings in the same room (active only)
    const conflicts = await Booking.find({
      roomId: new Types.ObjectId(roomId),
      status: "active",
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
      .sort({ startTime: 1 })
      .lean();

    if (conflicts.length > 0) {
      return res.status(409).json({
        conflict: true,
        message: "Room is already booked during this time",
        conflictingBookings: conflicts,
      });
    }

    // Create booking
    const booking = await Booking.create({
      roomId: new Types.ObjectId(roomId),
      userId: new Types.ObjectId(req.user.id),
      startTime: start,
      endTime: end,
      status: "active",
    });

    // Emit realtime event (optional)
    (req as any).io?.emit("booking-created", {
      bookingId: booking._id.toString(),
      roomId: booking.roomId.toString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId.toString(),
    });

    return res.status(201).json(booking);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err) });
  }
});

/**
 * GET /bookings/me
 * Get current user's bookings
 */
router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = new Types.ObjectId(req.user.id);

    const bookings = await Booking.find({ userId })
      .sort({ startTime: -1 })
      .lean();

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err) });
  }
});

/**
 * PATCH /bookings/:id/reschedule
 * Reschedule booking (only owner)
 * Body: { startTime, endTime }
 */
router.patch("/:id/reschedule", auth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bookingId = req.params.id;
    const { startTime, endTime } = req.body as { startTime: string; endTime: string };

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "startTime and endTime are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid startTime/endTime" });
    }

    if (start >= end) {
      return res.status(400).json({ conflict: false, message: "startTime must be before endTime" });
    }

    if (start.getTime() < Date.now()) {
      return res.status(400).json({ conflict: false, message: "Booking in the past is not allowed" });
    }

    // Load booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Owner check
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Conflict check excluding current booking
    const conflicts = await Booking.find({
      _id: { $ne: booking._id },
      roomId: booking.roomId,
      status: "active",
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
      .sort({ startTime: 1 })
      .lean();

    if (conflicts.length > 0) {
      return res.status(409).json({
        conflict: true,
        message: "Room is already booked during this time",
        conflictingBookings: conflicts,
      });
    }

    // Update booking
    booking.startTime = start;
    booking.endTime = end;
    await booking.save();

    // Emit realtime event (optional)
    (req as any).io?.emit("booking-rescheduled", {
      bookingId: booking._id.toString(),
      roomId: booking.roomId.toString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId.toString(),
    });

    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err) });
  }
});

/**
 * PATCH /bookings/:id/cancel
 * Cancel booking (only owner)
 */
router.patch("/:id/cancel", auth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Owner check
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Emit realtime event (optional)
    (req as any).io?.emit("booking-cancelled", {
      bookingId: booking._id.toString(),
      roomId: booking.roomId.toString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId.toString(),
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err) });
  }
});

export default router;
