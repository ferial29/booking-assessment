import express from 'express';
import authRoutes from "./routes/auth";
import { createDefaultAdmin } from "./setup/createAdmin";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import roomsRoutes from './routes/rooms';
import bookingsRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// simple attach io to req for controllers
app.use((req, _res, next) => { (req as any).io = io; next(); });

// Routes
app.use('/auth', authRoutes);
app.use('/rooms', roomsRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/admin', adminRoutes);
app.use("/auth", authRoutes);


const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/booking_test';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO).then(async () => {
  console.log('Connected to MongoDB');

  // add admin if did not found
  await createDefaultAdmin();

  server.listen(PORT, () => console.log('Server listening on', PORT));
}).catch(err => {
  console.error('Mongo connect error', err);
});

// Socket events (broadcast from controllers)
io.on('connection', socket => {
  console.log('ws client connected', socket.id);
});
app.get('/', (req, res) => {
  res.send('Server is running!');
});

