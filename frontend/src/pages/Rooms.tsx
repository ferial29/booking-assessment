import { useEffect, useState } from "react";
import axios from "axios";
import TimeRangePicker from "../components/TimeRangePicker";

export default function Rooms() {
  const [date, setDate] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  async function loadRooms() {
    if (!date) return;

    const res = await axios.get(
      `http://localhost:4000/rooms/availability?date=${date}`
    );

    setRooms(res.data);
  }

  async function submitBooking() {
    if (!selectedRoom) return alert("Select a room first");

    const token = localStorage.getItem("token");

    const payload = {
      roomId: selectedRoom.roomId,
      startTime: `${date}T${startTime}:00Z`,
      endTime: `${date}T${endTime}:00Z`,
    };

    try {
      await axios.post("http://localhost:4000/bookings", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Booking Confirmed!");
      loadRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking failed");
      console.log(err);
    }
  }

  useEffect(() => {
    if (date) loadRooms();
  }, [date]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold mb-4">Rooms Availability</h1>

      {/* Date Picker */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="p-3 border rounded-lg shadow-sm"
      />

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="p-4 bg-white shadow rounded border hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{room.roomName}</h2>

            <ul className="text-gray-600 mt-2 text-sm">
              {room.availableSlots.length === 0 && (
                <li className="text-red-500">No available slots</li>
              )}

              {room.availableSlots.map((slot: any, i: number) => (
                <li key={i}>
                  {new Date(slot.start).toLocaleTimeString()} —
                  {new Date(slot.end).toLocaleTimeString()}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedRoom(room)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Select Room
            </button>
          </div>
        ))}
      </div>

      {/* Booking Panel */}
      {selectedRoom && (
        <div className="p-5 bg-gray-50 rounded-xl border shadow mt-6">
          <h3 className="text-lg font-semibold mb-3">
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
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
