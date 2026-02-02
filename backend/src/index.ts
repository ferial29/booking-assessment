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
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

/* ---------- CORS (مهم برای Vercel) ---------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://booking-assessment-phi.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

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
