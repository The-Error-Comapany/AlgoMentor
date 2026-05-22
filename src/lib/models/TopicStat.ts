import mongoose, { Schema, Document } from "mongoose";

export interface ITopicStat extends Document {
  userId: string;
  platform: "leetcode" | "codeforces";
  topic: string;
  count: number;
}

const TopicStatSchema = new Schema<ITopicStat>({
  userId: { type: String, required: true },
  platform: { type: String, enum: ["leetcode", "codeforces"], required: true },
  topic: { type: String, required: true },
  count: { type: Number, required: true },
});

// Compound index for matching specific topic stats per user
TopicStatSchema.index({ userId: 1, platform: 1, topic: 1 }, { unique: true });

export default mongoose.models.TopicStat || mongoose.model<ITopicStat>("TopicStat", TopicStatSchema);
export { TopicStatSchema };
