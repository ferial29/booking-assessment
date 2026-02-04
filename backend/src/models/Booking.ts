import { Schema, model, Types } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    room: { type: Types.ObjectId, ref: "Room", required: true },

    // اگر تو پروژه‌ات startDate/endDate داری همین‌ها رو نگه می‌داریم
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Booking", bookingSchema);
