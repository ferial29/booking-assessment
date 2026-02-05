# Booking Management System (Full-Stack Technical Assessment)

A complete **Room Booking System** built for a technical evaluation.  
This application demonstrates:

- Secure authentication (Register/Login) using JWT  
- Role-based access control (Admin/User)  
- Room availability calculation per date  
- Booking conflict detection and prevention  
- Real-time events with Socket.IO  
- Modern frontend with React + TypeScript + Tailwind  
- Scalable backend built in Node.js + Express + MongoDB  

---
## 🌐 Live Demo

- **Frontend (Vercel):** https://booking-assessment-phi.vercel.app  
- **Backend (Render):** https://booking-assessment.onrender.com  


## 📦 Technology Stack

### **Backend**
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- TypeScript  
- JWT (jsonwebtoken)  
- bcryptjs  
- Socket.IO  

**Backend Dependencies**

express
mongoose
jsonwebtoken
bcryptjs
socket.io
dotenv
cors
markdown

**Backend Dev Dependencies**

# 🟦 1. Running the Backend

## Requirements
- Node.js 18+
- MongoDB (local or cloud)

## Environment Variables  
Create `.env` inside `/backend`:

```
MONGO_URI=mongodb://localhost:27017/booking_test
JWT_SECRET=your_secret_key
PORT=4000
```

## Install Dependencies
```
cd backend
npm install
```

## Start Backend
```
npm run dev
```

Backend runs at:
```
http://localhost:4000
```

---

### **Frontend**
- React (Vite)  
- TypeScript  
- Tailwind CSS  
- Axios  
- React Router  

**Frontend Dependencies**

**Frontend Dev Dependencies**
typescript
vite
tailwindcss
postcss
autoprefixer
@types/react
@types/react-dom

# 🟩 2. Running the Frontend

## Requirements
- Node.js 18+

## Install Dependencies
```
cd frontend
npm install
```

## Start Frontend
```
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

It automatically connects to the backend at:
```
http://localhost:4000
```

---

# 🔗 Backend–Frontend Connection
- REST API via fetch
- Real-time updates via Socket.IO
- Token stored in React state

---

# ✔️ System Ready
| Component | URL |
|----------|-----|
| Backend API | http://localhost:4000 |
| Frontend UI | http://localhost:5173 |
| WebSocket | ws://localhost:4000 |

---

## ✅ Default Admin Account

A default admin is automatically created on server start:

- **Email:** admin@demo.com  
- **Password:** Admin1234  

Server listening on 4000




