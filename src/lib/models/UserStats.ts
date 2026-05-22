import mongoose, { Schema, Document } from "mongoose";

export interface IRatingHistory {
  contestName: string;
  rating: number;
  date: Date;
}

export interface IUserStats extends Document {
  userId: string;
  platform: "leetcode" | "codeforces";
  rating?: number;
  maxRating?: number;
  rank?: string;
  solved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  ranking?: number;
  contestsAttended?: number;
  ratingHistory: IRatingHistory[];
  lastSynced: Date;
}

const UserStatsSchema = new Schema<IUserStats>({
  userId: { type: String, required: true },
  platform: { type: String, enum: ["leetcode", "codeforces"], required: true },
  rating: { type: Number },
  maxRating: { type: Number },
  rank: { type: String },
  solved: { type: Number },
  easySolved: { type: Number },
  mediumSolved: { type: Number },
  hardSolved: { type: Number },
  ranking: { type: Number },
  contestsAttended: { type: Number },
  ratingHistory: [
    {
      contestName: { type: String, required: true },
      rating: { type: Number, required: true },
      date: { type: Date, required: true },
    },
  ],
  lastSynced: { type: Date, default: Date.now },
});

// Ensure a compound index to search quickly and guarantee upsert integrity
UserStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.models.UserStats || mongoose.model<IUserStats>("UserStats", UserStatsSchema);
export { UserStatsSchema };
