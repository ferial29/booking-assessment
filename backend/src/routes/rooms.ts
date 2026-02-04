import { Router, Request, Response } from "express";
import * as auth from "../middleware/auth";
import Room from "../models/Room";
import Booking from "../models/Booking";

const router = Router();

/** GET /rooms - list rooms */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return res.json(rooms);
  } catch (_err) {
    return res.status(500).json({ message: "Failed to load rooms" });
  }
});

/** POST /rooms - create room (admin) */
router.post(
  "/",
  auth.authMiddleware,
  auth.requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const { name, capacity, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: "name is required" });
      }

      const room = await Room.create({
        name,
        capacity: capacity ? Number(capacity) : undefined,
        description: description || "",
      });

      return res.status(201).json(room);
    } catch (_err) {
      return res.status(500).json({ message: "Failed to create room" });
    }
  }
);

/** DELETE /rooms/:id - delete room (admin) */
router.delete(
  "/:id",
  auth.authMiddleware,
  auth.requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const room = await Room.findById(id);
      if (!room) return res.status(404).json({ message: "Room not found" });

      await Booking.deleteMany({ room: id });
      await Room.findByIdAndDelete(id);

      return res.json({ message: "Room deleted" });
    } catch (_err) {
      return res.status(500).json({ message: "Failed to delete room" });
    }
  }
);

/** GET /rooms/availability?date=YYYY-MM-DD */
router.get("/availability", async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date || "");
    if (!date) return res.status(400).json({ message: "date is required" });

    // Local day window
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const rooms = await Room.find().sort({ createdAt: -1 });

    const businessHours = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    const results: any[] = [];

    for (const room of rooms) {
      const bookings = await Booking.find({
        room: room._id,
        startDate: { $lte: dayEnd },
        endDate: { $gte: dayStart },
      });

      const availableSlots: { start: string; end: string }[] = [];

      for (let i = 0; i < businessHours.length - 1; i++) {
        const start = new Date(`${date}T${businessHours[i]}:00`);
        const end = new Date(`${date}T${businessHours[i + 1]}:00`);

        const overlaps = bookings.some((b: any) => {
          const bStart = new Date(b.startDate);
          const bEnd = new Date(b.endDate);
          return start < bEnd && end > bStart;
        });

        if (!overlaps) {
          availableSlots.push({
            start: start.toISOString(),
            end: end.toISOString(),
          });
        }
      }

      results.push({
        roomId: room._id.toString(),
        roomName: room.name,
        capacity: room.capacity,
        availableSlots,
      });
    }

    return res.json(results);
  } catch (_err) {
    return res.status(500).json({ message: "Failed to load availability" });
  }
});

export default router;
