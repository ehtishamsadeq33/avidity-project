import mongoose, { Schema, type Model } from "mongoose";

const ResponseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female"] },
    ageGroup: { type: String, required: true },
    yearsInOrganization: { type: String, required: true },
    yearsInPosition: { type: String, required: true },
    numberOfReports: { type: String, required: true },
    answers: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

export type ResponseDoc = mongoose.InferSchemaType<typeof ResponseSchema>;

export const ResponseModel: Model<ResponseDoc> =
  (mongoose.models["Response"] as Model<ResponseDoc>) ||
  mongoose.model<ResponseDoc>("Response", ResponseSchema);
