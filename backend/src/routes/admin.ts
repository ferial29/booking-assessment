import { Router, Request, Response } from "express";
import * as auth from "../middleware/auth";
import Booking from "../models/Booking";
import Room from "../models/Room";

const router = Router();

router.get(
  "/bookings",
  auth.authMiddleware,
  auth.requireRole("admin"),
  async (_req: Request, res: Response) => {
    try {
      const bookings = await Booking.find()
        .populate("user", "name email")
        .populate("room", "name capacity")
        .sort({ createdAt: -1 });

      return res.json(bookings);
    } catch {
      return res.status(500).json({ message: "Failed to load admin bookings" });
    }
  }
);

// Optional: admin rooms list
router.get(
  "/rooms",
  auth.authMiddleware,
  auth.requireRole("admin"),
  async (_req: Request, res: Response) => {
    try {
      const rooms = await Room.find().sort({ createdAt: -1 });
      return res.json(rooms);
    } catch {
      return res.status(500).json({ message: "Failed to load rooms" });
    }
  }
);

export default router;
