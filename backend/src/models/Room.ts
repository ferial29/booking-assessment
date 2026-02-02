import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const roomSchema = new Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export type RoomDoc = InferSchemaType<typeof roomSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Room =
  (mongoose.models.Room as Model<RoomDoc>) ||
  mongoose.model<RoomDoc>("Room", roomSchema);

export default Room;
