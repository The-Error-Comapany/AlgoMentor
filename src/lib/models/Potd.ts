import mongoose, { Schema, Document } from "mongoose";

export interface IPotd extends Document {
  date: string; // YYYY-MM-DD
  platform: string;
  title: string;
  difficulty: string;
  url: string;
  tags: string[];
  createdAt: Date;
}

const PotdSchema = new Schema<IPotd>({
  date: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  url: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 48 * 60 * 60 // 48 hours in seconds
  },
});

export default mongoose.models.Potd || mongoose.model<IPotd>("Potd", PotdSchema);
export { PotdSchema };
