import express from "express";
import Booking from "../models/Booking";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import type { Response } from "express";
import type { AuthRequest } from "../types/AuthRequest";

const router = express.Router();

/**
 * GET /admin/bookings
 * Admin: get all bookings
 */
router.get(
  "/bookings",
  authMiddleware,
  roleMiddleware("admin"),
  async (req: AuthRequest, res: Response) => {
    const bookings = await Booking.find({})
      .populate("roomId")
      .populate("userId")
      .sort({ startTime: 1 });

    return res.json(bookings);
  }
);

export default router;
