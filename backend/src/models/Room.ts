import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model("Room", roomSchema);
