import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const bookingSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type BookingDoc = InferSchemaType<typeof bookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Booking =
  (mongoose.models.Booking as Model<BookingDoc>) ||
  mongoose.model<BookingDoc>("Booking", bookingSchema);

export default Booking;
