import mongoose, { Schema, Document } from "mongoose";

export interface IContest extends Document {
  platform: "leetcode" | "codeforces";
  slug: string;
  name: string;
  startTime: Date;
  duration: number; // in seconds
  url: string;
  endTime: Date;
}

const ContestSchema = new Schema<IContest>({
  platform: { type: String, enum: ["leetcode", "codeforces"], required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  url: { type: String, required: true },
  endTime: { 
    type: Date, 
    required: true,
    expires: 24 * 60 * 60 // 24 hours in seconds
  },
});

// Platform + Slug unique index
ContestSchema.index({ platform: 1, slug: 1 }, { unique: true });

export default mongoose.models.Contest || mongoose.model<IContest>("Contest", ContestSchema);
export { ContestSchema };
