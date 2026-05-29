import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  userId: string;
  platform: "leetcode" | "codeforces";
  title: string;
  titleSlug: string;
  verdict: string;
  language: string;
  timestamp: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  userId: { type: String, required: true },
  platform: { type: String, enum: ["leetcode", "codeforces"], required: true },
  title: { type: String, required: true },
  titleSlug: { type: String, required: true },
  verdict: { type: String, required: true },
  language: { type: String, required: true },
  timestamp: { 
    type: Date, 
    required: true,
    expires: 30 * 24 * 60 * 60 // 30 days in seconds
  },
});

// Compound index for fast upserts and querying
SubmissionSchema.index({ userId: 1, platform: 1, titleSlug: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema);
export { SubmissionSchema };
