import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

type Booking = {
  _id: string;
  startDate?: string;
  endDate?: string;
  room?: { name?: string };
  createdAt?: string;
};

export default function MyBookings() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Missing token. Please login again.");
          return;
        }

        const res = await axios.get(`${API_URL}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setItems(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div>
                <strong>Room:</strong> {b.room?.name || "-"}
              </div>
              <div>
                <strong>From:</strong>{" "}
                {b.startDate ? new Date(b.startDate).toLocaleString() : "-"}
              </div>
              <div>
                <strong>To:</strong>{" "}
                {b.endDate ? new Date(b.endDate).toLocaleString() : "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
