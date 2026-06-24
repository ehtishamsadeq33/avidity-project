import mongoose, { Schema, type Model } from "mongoose";

const AdminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { collection: "admins" },
);

export type AdminDoc = mongoose.InferSchemaType<typeof AdminSchema>;

export const AdminModel: Model<AdminDoc> =
  (mongoose.models["Admin"] as Model<AdminDoc>) ||
  mongoose.model<AdminDoc>("Admin", AdminSchema);
