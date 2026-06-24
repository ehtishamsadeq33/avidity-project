import mongoose, { Schema, type Model } from "mongoose";

const phaseSchema = new Schema(
  {
    phaseType: { type: String, enum: ["pre", "post"], required: true },
    code: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const groupSchema = new Schema({
  groupName: { type: String, required: true },
  organization: { type: String, default: "" },
  description: { type: String, default: "" },
  phases: { type: [phaseSchema], default: [] },
  cohort: { type: String },
  createdBy: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

export type PhaseDoc = {
  phaseType: "pre" | "post";
  code: string;
  enabled: boolean;
  createdAt: Date;
};

export type GroupDoc = mongoose.InferSchemaType<typeof groupSchema>;

export const GroupModel: Model<GroupDoc> =
  (mongoose.models["Group"] as Model<GroupDoc>) ||
  mongoose.model<GroupDoc>("Group", groupSchema);
