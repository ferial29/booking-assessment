import { Router, Response } from "express";
import * as auth from "../middleware/auth";
import Booking from "../models/Booking";
import Room from "../models/Room";

const router = Router();

/** GET /bookings - user's bookings */
router.get("/", auth.authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    const bookings = await Booking.find({ user: userId })
      .populate("room", "name")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch {
    return res.status(500).json({ message: "Failed to load bookings" });
  }
});

/** POST /bookings - create booking */
router.post("/", auth.authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    // Accept both naming styles to avoid frontend/backend mismatch
    const roomId = req.body.roomId;
    const startDate = req.body.startDate ?? req.body.startTime;
    const endDate = req.body.endDate ?? req.body.endTime;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "roomId, startDate, endDate are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const booking = await Booking.create({
      user: userId,
      room: roomId,
      startDate,
      endDate,
    });

    const io = (req as any).io;
    if (io) io.emit("bookingCreated", booking);

    return res.status(201).json(booking);
  } catch {
    return res.status(500).json({ message: "Failed to create booking" });
  }
});

export default router;
