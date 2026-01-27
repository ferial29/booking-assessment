import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
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

/* =========================
   Socket.io
========================= */
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

/* =========================
   CORS (Vercel + Local)
========================= */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / health check

      if (
        origin === "http://localhost:5173" ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
app.options("*", cors());

/* =========================
   Middlewares
========================= */
app.use(express.json());

// attach io to req
app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

/* =========================
   Routes
========================= */
app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/admin", adminRoutes);

/* =========================
   Health check
========================= */
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

/* =========================
   Database & Server
========================= */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/booking_test";

const PORT = Number(process.env.PORT) || 4000;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // create default admin if not exists
    await createDefaultAdmin();

    server.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Mongo connect error", err);
  });

/* =========================
   Socket events
========================= */
io.on("connection", (socket) => {
  console.log("ws client connected:", socket.id);
});
