import mongoose, { Schema, Document } from "mongoose";

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  contestId: mongoose.Types.ObjectId;
  contestSlug: string;
  platform: string;
  notifyAt: Date;
  sent: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
  contestSlug: { type: String, required: true },
  platform: { type: String, required: true },
  notifyAt: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// A user should only have one reminder per contest
ReminderSchema.index({ userId: 1, contestId: 1 }, { unique: true });

// Optimize querying for cron job (find unsent reminders where notifyAt is past)
ReminderSchema.index({ sent: 1, notifyAt: 1 });

export default mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", ReminderSchema);
export { ReminderSchema };
