import express from "express";
import Booking from "../models/Booking";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = express.Router();

router.get(
  "/bookings",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    const bookings = await Booking.find({})
      .populate("roomId")
      .populate("userId")
      .sort({ startTime: 1 });

    res.json(bookings);
  }
);

export default router;
