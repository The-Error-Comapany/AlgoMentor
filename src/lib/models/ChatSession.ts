import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export interface IChatSession extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  lastUpdated: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [
    {
      sender: { type: String, enum: ["user", "ai"], required: true },
      text: { type: String, required: true },
      time: { type: String, required: true }
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

ChatSessionSchema.index({ userId: 1, lastUpdated: -1 });

export default mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
