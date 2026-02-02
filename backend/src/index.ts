import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import roomsRoutes from "./routes/rooms";
import bookingsRoutes from "./routes/bookings";
import adminRoutes from "./routes/admin";
import { createDefaultAdmin } from "./setup/createAdmin";

dotenv.config();

const app = express();
const server = http.createServer(app);

/** ✅ Allowed origins (Frontend) */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://booking-assessment-phi.vercel.app",
];

/** ✅ Socket.IO CORS (must NOT be "*" if credentials is true) */
const io = new SocketIOServer(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

/* ---------- CORS (مهم برای Vercel/Local) ---------- */
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/** ✅ پاسخ دادن به preflight */
app.options("*", cors({ origin: ALLOWED_ORIGINS, credentials: true }));

app.use(express.json());

/* attach socket.io to req */
app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

/* ---------- Routes ---------- */
app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/admin", adminRoutes);

app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

/* ---------- Mongo ---------- */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/booking_test";
const PORT = Number(process.env.PORT) || 4000;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await createDefaultAdmin();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });

/* ---------- Socket ---------- */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});
