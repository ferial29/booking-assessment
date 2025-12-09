import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import TimeRangePicker from "../components/TimeRangePicker";

export default function Rooms() {
  // Get token from localStorage (VERY IMPORTANT)
  const token = localStorage.getItem("token");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rooms, setRooms] = useState<any[]>([]);
  const [selection, setSelection] = useState({
    roomId: "",
    start: "",
    end: "",
  });

  // Fetch rooms when date changes
  useEffect(() => {
    fetchData();
  }, [date]);

  // Real-time events
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("booking-created", () => fetchData());
    socket.on("booking-cancelled", () => fetchData());
    socket.on("booking-rescheduled", () => fetchData());

    return () => socket.disconnect();
  }, []);

  // API to fetch availability
  async function fetchData() {
    try {
      const res = await fetch(
        `http://localhost:4000/rooms/availability?date=${date}`
      );
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.log("Error loading rooms:", err);
    }
  }

  // BOOK A ROOM
  async function book() {
    if (!selection.roomId)
      return alert("Please select a room before booking.");

    if (!selection.start || !selection.end)
      return alert("Please select a valid time range.");

    if (!token) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(selection),
      });

      const data = await res.json();

      if (res.status === 409) {
        alert("Conflict: " + data.message);
      } else if (res.status === 401) {
        alert("Unauthorized. Please login again.");
      } else {
        alert("Booking successful!");
        fetchData();
      }
    } catch (err) {
      console.log("Booking error:", err);
    }
  }

  return (
    <div className="p-4">

      <h3 className="text-xl font-semibold mb-2">Rooms Availability</h3>

      {/* Select date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded mb-4"
      />

      {/* Display room cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((r: any) => (
          <div key={r.roomId} className="p-4 bg-white shadow rounded-lg">
            <h4 className="font-bold mb-2 text-lg">{r.roomName}</h4>

            <ul className="text-sm text-gray-600 mb-3">
              {r.availableSlots.length === 0 && (
                <li>No available slots</li>
              )}

              {r.availableSlots.map((slot: any, i: number) => (
                <li key={i}>
                  {new Date(slot.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(slot.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelection({ ...selection, roomId: r.roomId })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Select Room
            </button>
          </div>
        ))}
      </div>

      {/* Booking panel */}
      {selection.roomId && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Book Selected Room</h3>

          <TimeRangePicker
            start={selection.start}
            end={selection.end}
            onChange={(v) => setSelection({ ...selection, ...v })}
          />

          <button
            onClick={book}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
