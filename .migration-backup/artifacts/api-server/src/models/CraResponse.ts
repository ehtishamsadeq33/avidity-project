import mongoose, { Schema, type Model } from "mongoose";

const CandidateInfoSchema = new Schema(
  {
    name: { type: String, default: "" },
    gender: { type: String, default: "" },
    age: { type: String, default: "" },
    yearsInOrganization: { type: String, default: "" },
    yearsInPosition: { type: String, default: "" },
  },
  { _id: false },
);

const PerceivedActualSchema = new Schema(
  {
    whatTheyThinkTotal: { type: Number, default: 0 },
    whatTheyThinkPercent: { type: Number, default: 0 },
    whereTheyAreTotal: { type: Number, default: 0 },
    whereTheyArePercent: { type: Number, default: 0 },
  },
  { _id: false },
);

const SkillsSchema = new Schema(
  {
    behavior: { type: Number, default: 0 },
    knowledge: { type: Number, default: 0 },
    skill: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
  },
  { _id: false },
);

const WillSchema = new Schema(
  {
    belief: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    commitment: { type: Number, default: 0 },
    motivation: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
  },
  { _id: false },
);

const EnvSupportSchema = new Schema(
  {
    leadership: { type: Number, default: 0 },
    organization: { type: Number, default: 0 },
    people: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
  },
  { _id: false },
);

const DirectiveNonDirectiveSchema = new Schema(
  {
    total: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
  },
  { _id: false },
);

const CompositesSchema = new Schema(
  {
    skills: { type: SkillsSchema, default: () => ({}) },
    will: { type: WillSchema, default: () => ({}) },
    environmentalSupport: { type: EnvSupportSchema, default: () => ({}) },
    directiveNonDirective: {
      type: DirectiveNonDirectiveSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const CraResponseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    submittedAt: { type: Date, required: true, default: () => new Date() },
    scores: {
      type: Schema.Types.Mixed,
      required: true,
    },
    totalResponses: { type: Number, required: true },
    candidateInfo: { type: CandidateInfoSchema, default: () => ({}) },
    perceivedActual: { type: PerceivedActualSchema, default: () => ({}) },
    composites: { type: CompositesSchema, default: () => ({}) },
    icNumber: { type: String, index: true, default: "" },
    groupCode: { type: String, default: null },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    phase: { type: String, enum: ["pre", "post", null], default: null },
    submissionType: { type: String, enum: ["individual", "group"], default: "individual" },
  },
  { collection: "cra_responses" },
);

export type CraResponseDoc = mongoose.InferSchemaType<typeof CraResponseSchema>;

export const CraResponseModel: Model<CraResponseDoc> =
  (mongoose.models["CraResponse"] as Model<CraResponseDoc>) ||
  mongoose.model<CraResponseDoc>("CraResponse", CraResponseSchema);
