import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) return null; // Hide navbar on Login & Home

  return (
    <nav className="flex items-center justify-between bg-white shadow-md px-6 py-3 mb-6 rounded-xl">

      <div className="flex items-center gap-6">
        <span className="text-xl font-semibold text-blue-600">
          BookingApp
        </span>

        {user.role === "admin" ? (
          <>
            <Link className="hover:text-blue-600 font-medium" to="/dashboard">Dashboard</Link>
            <Link className="hover:text-blue-600 font-medium" to="/rooms">Rooms</Link>
            <Link className="hover:text-blue-600 font-medium" to="/my-bookings">My Bookings</Link>
            <Link className="hover:text-blue-600 font-medium" to="/create-room">Create Room</Link>
          </>
        ) : (
          <>
            <Link className="hover:text-blue-600 font-medium" to="/rooms">Rooms</Link>
            <Link className="hover:text-blue-600 font-medium" to="/my-bookings">My Bookings</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          {user?.name}
        </span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

    </nav>
  );
}
