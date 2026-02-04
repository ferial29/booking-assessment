import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Toast from "../components/Toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const [toastMessage, setToastMessage] = useState("");

  const token = localStorage.getItem("token");

  const userRole = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw)?.role || null;
    } catch {
      return null;
    }
  }, []);

  const isAdmin = userRole === "admin";

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(true);
  };

  async function loadRooms() {
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function create(e: any) {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/rooms`,
        { name, capacity: Number(capacity), description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Room created successfully!");
      setName("");
      setCapacity("");
      setDescription("");
      loadRooms();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to create room");
    }
  }

  async function deleteRoom(roomId: string) {
    if (!confirm("Delete this room?")) return;

    try {
      await axios.delete(`${API_URL}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Room deleted");
      loadRooms();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to delete room");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        type={toastType}
        message={toastMessage}
        position="bottom-center"
      />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-3xl p-8 mb-10 border"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create a New Room</h1>
        <p className="text-gray-600 mb-8">
          Add new meeting rooms to your system. These rooms will be available for booking by users.
        </p>

        <form onSubmit={create} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Room Name</label>
            <input
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Conference Room A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Capacity</label>
            <input
              type="number"
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 12"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Description (Optional)</label>
            <textarea
              className="w-full p-3 border rounded-xl shadow-sm h-24 resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short description about this room..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition"
            >
              Create Room
            </button>

            <button
              type="button"
              onClick={() => {
                setName("");
                setCapacity("");
                setDescription("");
              }}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl shadow"
            >
              Reset
            </button>
          </div>
        </form>
      </motion.div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Existing Rooms</h2>
      </div>

      {rooms.length === 0 ? (
        <p className="text-gray-600">No rooms created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-lg rounded-2xl p-6 border"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{room.name}</h3>
                  <p className="text-gray-600 text-sm">Capacity: {room.capacity}</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>

              {room.description && (
                <p className="text-gray-500 text-sm mt-3">{room.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
