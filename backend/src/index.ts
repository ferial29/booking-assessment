import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors, { CorsOptions } from "cors";
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

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://booking-assessment-phi.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

const io = new SocketIOServer(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

app.use("/auth", authRoutes);
app.use("/rooms", roomsRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/admin", adminRoutes);

app.get("/", (_req, res) => res.send("API is running 🚀"));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/booking_test";
const PORT = Number(process.env.PORT) || 4000;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await createDefaultAdmin();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Mongo connection error:", err));

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});
