import React from "react";

interface Props {
  startTime: string;
  endTime: string;
  setStartTime: (value: string) => void;
  setEndTime: (value: string) => void;
}

export default function TimeRangePicker({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-xl border border-gray-200 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-700">Select Time Range</h3>

      <div className="flex flex-col gap-3">
        {/* Start Time */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
