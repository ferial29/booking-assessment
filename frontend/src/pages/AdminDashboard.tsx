import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  async function load() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      
      setRooms(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load admin bookings");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {rooms.length === 0 && (
        <p className="text-gray-500">No bookings available.</p>
      )}

      {rooms.map((room) => (
        <div
          key={room.roomId}
          className="bg-white shadow-lg rounded-xl border p-5 space-y-3"
        >
          <h2 className="text-xl font-semibold text-blue-700">
            {room.roomName}
          </h2>

          {room.bookings.length === 0 && (
            <p className="text-gray-500">No bookings for this room.</p>
          )}

          <div className="grid gap-3">
            {room.bookings.map((b: any) => (
              <div
                key={b._id}
                className="p-4 bg-gray-50 border rounded-lg shadow-sm"
              >
                <div className="font-medium text-gray-800">
                  User: {b.userId?.name || "Unknown"}
                </div>

                <div className="text-gray-600 text-sm">
                  <strong>From:</strong>{" "}
                  {new Date(b.startTime).toLocaleString()}
                </div>

                <div className="text-gray-600 text-sm">
                  <strong>To:</strong> {new Date(b.endTime).toLocaleString()}
                </div>

                <div className="text-gray-500 text-xs mt-1">
                  Status: {b.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
