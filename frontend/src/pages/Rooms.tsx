import { useEffect, useState } from "react";
import axios from "axios";
import TimeRangePicker from "../components/TimeRangePicker";
import Toast from "../components/Toast";

const API_URL = import.meta.env.VITE_API_URL;

type Slot = {
  start: string;
  end: string;
};

type Room = {
  roomId: string;
  roomName: string;
  capacity: number;
  availableSlots: Slot[];
};

export default function Rooms() {
  const [date, setDate] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  function showToast(
    message: string,
    type: "success" | "error" | "info" = "info"
  ) {
    setToastMsg(message);
    setToastType(type);
    setToastOpen(true);
  }

  async function loadRooms() {
    if (!date) return;

    try {
      const res = await axios.get(`${API_URL}/rooms/availability`, {
        params: { date },
      });
      setRooms(res.data || []);
    } catch (err) {
      console.error(err);
      setRooms([]);
      showToast("Failed to load rooms", "error");
    }
  }

  async function submitBooking() {
    if (!selectedRoom) return showToast("Select a room first", "info");

    const token = localStorage.getItem("token");
    if (!token) return showToast("Please login again", "error");

    try {
      await axios.post(
        `${API_URL}/bookings`,
        {
          roomId: selectedRoom.roomId,
          startDate: `${date}T${startTime}:00`,
          endDate: `${date}T${endTime}:00`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast("Booking confirmed!", "success");
      setSelectedRoom(null);
      loadRooms();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Booking failed", "error");
    }
  }

  useEffect(() => {
    if (date) loadRooms();
  }, [date]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rooms Availability</h1>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="p-3 border rounded-lg"
      />

      {rooms.length === 0 && date && (
        <p className="text-gray-500">No rooms found for this date.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="border rounded-xl p-5 bg-white shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">{room.roomName}</h2>
                <p className="text-sm text-gray-600">
                  Capacity: {room.capacity}
                </p>
              </div>

              <button
                onClick={() => setSelectedRoom(room)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Select Room
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {room.availableSlots.length === 0 && (
                <span className="text-red-500 col-span-2">
                  No available slots
                </span>
              )}

              {room.availableSlots.map((slot, i) => (
                <div
                  key={i}
                  className="border rounded-md px-3 py-2 bg-gray-50 text-center"
                >
                  {new Date(slot.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(slot.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div className="border rounded-xl p-6 bg-gray-50">
          <h3 className="font-semibold text-lg mb-3">
            Book Room: {selectedRoom.roomName}
          </h3>

          <TimeRangePicker
            startTime={startTime}
            endTime={endTime}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
          />

          <button
            onClick={submitBooking}
            className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
          >
            Confirm Booking
          </button>
        </div>
      )}

      <Toast
        open={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
