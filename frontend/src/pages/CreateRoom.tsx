import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  async function loadRooms() {
    try {
      const res = await axios.get("http://localhost:4000/rooms");
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
    setMessage("");

    try {
      await axios.post(
        "http://localhost:4000/rooms",
        {
          name,
          capacity: Number(capacity),
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Room created successfully!");

      setName("");
      setCapacity("");
      setDescription("");

      loadRooms();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to create room");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/60 shadow-xl rounded-3xl p-10 mb-10 border"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Create a New Room
        </h1>

        <p className="text-gray-600 mb-8">
          Add new meeting rooms to your system. These rooms will be available
          for booking by users.
        </p>

        {message && (
          <div className="mb-4 py-3 px-4 text-center rounded-lg bg-blue-100 text-blue-700 border border-blue-300">
            {message}
          </div>
        )}

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
            ></textarea>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition transform hover:scale-105"
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
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl shadow"
            >
              Reset
            </button>
          </div>
        </form>
      </motion.div>

      {/* Display existing rooms */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Existing Rooms</h2>

      {rooms.length === 0 ? (
        <p className="text-gray-600">No rooms created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-lg rounded-2xl p-6 border"
            >
              <h3 className="font-bold text-xl text-gray-800">{room.name}</h3>
              <p className="text-gray-600 text-sm">Capacity: {room.capacity}</p>

              {room.description && (
                <p className="text-gray-500 text-sm mt-2">{room.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
