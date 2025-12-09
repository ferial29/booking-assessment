import express from "express";
import Room from "../models/Room";
import Booking from "../models/Booking";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = express.Router();

/**
 * GET /rooms
 * Returns all rooms
 */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

/**
 * POST /rooms
 * Create a new room (Admin only)
 */
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { name, capacity, description } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ message: "Name and capacity are required" });
    }

    const room = await Room.create({
      name,
      capacity,
      description: description || "",
    });

    res.json(room);
  } catch (err) {
    console.error("Create room error:", err);
    res.status(500).json({ message: "Failed to create room" });
  }
});

/**
 * GET /rooms/availability?date=YYYY-MM-DD
 * Returns available slots for each room on selected date
 */
router.get("/availability", async (req, res) => {
  try {
    const dateQ = req.query.date as string;
    if (!dateQ) {
      return res.status(400).json({ message: "date required" });
    }

    const dayStart = new Date(dateQ);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const rooms = await Room.find({});
    const bookings = await Booking.find({
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
      status: "active",
    });

    const START_H = 8;
    const END_H = 20;

    const result = rooms.map((room) => {
      const rBookings = bookings.filter(
        (b) => b.roomId.toString() === room._id.toString()
      );

      const slots: any[] = [];

      let cursor = new Date(dayStart);
      cursor.setHours(START_H, 0, 0, 0);

      const sorted = rBookings.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );

      for (const b of sorted) {
        if (b.startTime > cursor) {
          slots.push({
            start: cursor.toISOString(),
            end: b.startTime.toISOString(),
          });
        }
        if (b.endTime > cursor) cursor = new Date(b.endTime);
      }

      const dayEndTime = new Date(dayStart);
      dayEndTime.setHours(END_H, 0, 0, 0);

      if (cursor < dayEndTime) {
        slots.push({
          start: cursor.toISOString(),
          end: dayEndTime.toISOString(),
        });
      }

      return {
        roomId: room._id,
        roomName: room.name,
        availableSlots: slots,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ message: "Error calculating availability" });
  }
});

export default router;
