import mongoose, { Schema, Document } from "mongoose";



export interface IUserStats extends Document {
  userId: string;
  platform: "leetcode" | "codeforces" | "geeksforgeeks";
  rating?: number;
  maxRating?: number;
  rank?: string;
  solved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  ranking?: number;
  contestsAttended?: number;

  streak?: number;
  weeklySolved?: number;
  activeDates?: string[];
  lastSynced: Date;
}

const UserStatsSchema = new Schema<IUserStats>({
  userId: { type: String, required: true },
  platform: { type: String, enum: ["leetcode", "codeforces", "geeksforgeeks"], required: true },
  rating: { type: Number },
  maxRating: { type: Number },
  rank: { type: String },
  solved: { type: Number },
  easySolved: { type: Number },
  mediumSolved: { type: Number },
  hardSolved: { type: Number },
  ranking: { type: Number },
  contestsAttended: { type: Number },

  streak: { type: Number },
  weeklySolved: { type: Number },
  activeDates: [{ type: String }],
  lastSynced: { type: Date, default: Date.now },
});

// Ensure a compound index to search quickly and guarantee upsert integrity
UserStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.models.UserStats || mongoose.model<IUserStats>("UserStats", UserStatsSchema);
export { UserStatsSchema };
