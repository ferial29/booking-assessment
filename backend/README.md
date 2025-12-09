# Booking Backend

Env:
- MONGO_URI (defaults to mongodb://localhost:27017/booking_test)
- JWT_SECRET

Run:
1. cd backend
2. npm install
3. npm run dev

Endpoints:
- POST /auth/register
- POST /auth/login
- POST /rooms (admin)
- GET /rooms/availability?date=YYYY-MM-DD
- POST /bookings
- PATCH /bookings/:id/reschedule
- GET /bookings/me
- GET /admin/bookings (admin)
Socket.io runs on same server; events: booking-created, booking-rescheduled, booking-cancelled
