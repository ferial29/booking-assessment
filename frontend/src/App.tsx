import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Rooms from "./pages/Rooms";
import Dashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";
import CreateRoom from "./pages/CreateRoom";

import Navbar from "./components/Navbar";

function Layout({ children }: any) {
  const location = useLocation();

  // مخفی کردن Navbar در صفحات login و home
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="max-w-6xl mx-auto p-4">
      {!hideNavbar && <Navbar />}
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* USER */}
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* ADMIN */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-room" element={<CreateRoom />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
