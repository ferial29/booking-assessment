export default function BookingCard({ booking }: any) {
    return (
      <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="text-lg font-semibold text-gray-700">
          Room: {booking.roomName}
        </h3>
  
        <p className="text-gray-500 mt-1">
          Date: {booking.date} | {booking.startTime} - {booking.endTime}
        </p>
      </div>
    );
  }
  