import { useEffect, useState } from "react";
import axios from "axios";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  async function load() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load your bookings");
    }
  }

  async function cancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      load();
    } catch (err) {
      alert("Unable to cancel booking");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-gray-500">You have no bookings yet.</p>
      )}

      <div className="grid gap-4">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="bg-white shadow border rounded-xl p-4 space-y-2"
          >
            <h3 className="font-semibold text-lg text-blue-600">
              {b.roomId?.name || "Room"}
            </h3>

            <p className="text-gray-500 text-sm">
              From: {new Date(b.startTime).toLocaleString()}
            </p>

            <p className="text-gray-500 text-sm">
              To: {new Date(b.endTime).toLocaleString()}
            </p>

            <button
              onClick={() => cancelBooking(b._id)}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Cancel Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
