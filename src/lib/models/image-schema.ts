import { Schema } from "mongoose";

// A stored Cloudinary image: only its id and size, URLs are built in code.
export const imageSchema = new Schema(
  { publicId: { type: String, required: true }, width: Number, height: Number },
  { _id: false },
);
