import React from "react";

export default function RoomCard({ room, onBook }: any) {
  return (
    <div className="bg-white p-4 shadow-md rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700">{room.name}</h3>

      <p className="text-gray-500 text-sm">Capacity: {room.capacity}</p>

      <button
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={onBook}
      >
        Book This Room
      </button>
    </div>
  );
}
