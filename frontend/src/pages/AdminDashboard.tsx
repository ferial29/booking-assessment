import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import  Toast  from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

type Booking = {
  _id: string;
  createdAt?: string;
  user?: { name?: string; email?: string };
  room?: { name?: string; capacity?: number };
  startDate?: string;
  endDate?: string;
};

type Room = {
  _id: string;
  name: string;
  capacity: number;
  description?: string;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<"bookings" | "rooms">("bookings");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  function showToast(message: string, type: ToastType = "info") {
    setToastMsg(message);
    setToastType(type);
    setToastOpen(true);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [bRes, rRes] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/rooms"),
      ]);
      setBookings(bRes.data || []);
      setRooms(rRes.data || []);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredBookings = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return bookings;
    return bookings.filter((b) => {
      const u = `${b.user?.name || ""} ${b.user?.email || ""}`.toLowerCase();
      const r = `${b.room?.name || ""}`.toLowerCase();
      return u.includes(s) || r.includes(s);
    });
  }, [q, bookings]);

  const filteredRooms = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rooms;
    return rooms.filter((r) => `${r.name}`.toLowerCase().includes(s));
  }, [q, rooms]);

  async function deleteRoomConfirmed() {
    if (!roomToDelete) return;

    try {
      await api.delete(`/rooms/${roomToDelete._id}`);
      showToast("Room deleted", "success");
      setConfirmOpen(false);
      setRoomToDelete(null);
      await fetchAll();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete room", "error");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />

      <ConfirmModal
        open={confirmOpen}
        title="Delete room?"
        description="This will also remove all bookings for this room."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setRoomToDelete(null);
        }}
        onConfirm={deleteRoomConfirmed}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Manage bookings and rooms.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("bookings")}
            className={`px-4 py-2 rounded-xl border ${
              tab === "bookings" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setTab("rooms")}
            className={`px-4 py-2 rounded-xl border ${
              tab === "rooms" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            Rooms
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tab === "bookings" ? "Search by user email or room name..." : "Search rooms..."}
          className="w-full max-w-md p-3 border rounded-xl bg-white"
        />
        <button
          onClick={fetchAll}
          className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {tab === "bookings" && (
        <div className="mt-6 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Bookings</h3>
            <p className="text-sm text-gray-600">{filteredBookings.length} items</p>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-5 text-gray-600">No bookings available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-5 py-3">Room</th>
                    <th className="text-left px-5 py-3">Start</th>
                    <th className="text-left px-5 py-3">End</th>
                    <th className="text-left px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="border-t">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{b.user?.name || "-"}</div>
                        <div className="text-gray-600">{b.user?.email || "-"}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{b.room?.name || "-"}</div>
                        <div className="text-gray-600">Capacity: {b.room?.capacity ?? "-"}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {b.startDate ? new Date(b.startDate).toLocaleString() : "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {b.endDate ? new Date(b.endDate).toLocaleString() : "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "rooms" && (
        <div className="mt-6 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Rooms</h3>
            <p className="text-sm text-gray-600">{filteredRooms.length} items</p>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="p-5 text-gray-600">No rooms available.</div>
          ) : (
            <div className="divide-y">
              {filteredRooms.map((r) => (
                <div key={r._id} className="p-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{r.name}</div>
                    <div className="text-sm text-gray-600">Capacity: {r.capacity}</div>
                    {r.description && <div className="text-sm text-gray-500 mt-1">{r.description}</div>}
                  </div>

                  <button
                    onClick={() => {
                      setRoomToDelete(r);
                      setConfirmOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
