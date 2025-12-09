import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      const role = JSON.parse(user).role;
      if (role === "admin") navigate("/dashboard");
      else navigate("/rooms");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
        Meeting Room Booking System
      </h1>

      <p className="text-gray-600 text-lg mb-8 text-center">
        Book meeting rooms, check availability and manage reservations easily.
      </p>

      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Login
      </button>
    </div>
  );
}
