import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) return null;

  const AdminLinks = () => (
    <>
      {/* reminder: setMenuOpen(false) */}
      <Link onClick={() => setMenuOpen(false)} to="/dashboard">Dashboard</Link>
      <Link onClick={() => setMenuOpen(false)} to="/rooms">Rooms</Link>
      <Link onClick={() => setMenuOpen(false)} to="/my-bookings">My Bookings</Link>
      <Link onClick={() => setMenuOpen(false)} to="/create-room">Create Room</Link>
    </>
  );

  const UserLinks = () => (
    <>
      <Link onClick={() => setMenuOpen(false)} to="/rooms">Rooms</Link>
      <Link onClick={() => setMenuOpen(false)} to="/my-bookings">My Bookings</Link>
    </>
  );

  return (
    <nav className="bg-white shadow-md px-4 py-3 mb-6 rounded-xl">
      <div className="flex justify-between items-center">

        <span className="text-xl font-semibold text-blue-600">
          BookingApp
        </span>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user.role === "admin" ? <AdminLinks /> : <UserLinks />}
        </div>

        {/* Desktop User */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-gray-600">{user.name}</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 border-t pt-4">
          <span className="text-gray-600">{user.name}</span>

          <div className="flex flex-col gap-2 font-medium">
            {user.role === "admin" ? <AdminLinks /> : <UserLinks />}
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mt-2"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
