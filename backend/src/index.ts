import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/auth";
import roomsRoutes from "./routes/rooms";
import bookingsRoutes from "./routes/bookings";
import adminRoutes from "./routes/admin";
import { createDefaultAdmin } from "./setup/createAdmin";

dotenv.config();

const app = express();
const server = http.createServer(app);

/**
 * ✅ CORS configuration
 * - Allow localhost dev
 * - Allow your Vercel frontend domain
 *
 * نکته: اگر دامنه Vercel شما تغییر کرد، همینجا هم آپدیت کن.
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://booking-assessment-phi.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Socket.IO with matching CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// attach io to req for controllers
app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

// Health check
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

// Routes
app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/admin", adminRoutes);

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/booking_test";
const PORT = Number(process.env.PORT) || 4000;

mongoose
  .connect(MONGO)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Seed default admin if not exists
    await createDefaultAdmin();

    server.listen(PORT, () => console.log("Server listening on", PORT));
  })
  .catch((err) => {
    console.error("Mongo connect error", err);
  });

// Socket events
io.on("connection", (socket) => {
  console.log("ws client connected", socket.id);
});
