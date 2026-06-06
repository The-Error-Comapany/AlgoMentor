import mongoose, { Schema, Document } from "mongoose";

export interface IReviewAttempt {
  date: Date;
  confidence: number;
  recalled: "Yes" | "Partially" | "No";
  interval: number;
}

export interface IKnowledgeCard {
  pattern?: string;
  coreIdea?: string;
  stateDefinition?: string;
  transitionLogic?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  commonMistakes?: string;
  interviewInsights?: string;
  relatedProblems?: string[];
}

export interface IRevisionItem extends Document {
  userId: string;
  problemId?: string; // null for external
  title: string;
  platform: string; // "LeetCode", "Codeforces", "AtCoder", "GeeksforGeeks", "Other"
  url: string;
  difficulty: string; // Easy, Medium, Hard
  tags: string[];
  pattern?: string;
  source: "library" | "external";
  personalNotes?: string;
  
  // Performance signals
  confidence: number; // 1-5
  correctness: boolean;
  timeTaken: number; // in minutes
  hintsUsed: number;
  submissionCount: number;

  // SM-2 parameters
  easinessFactor: number;
  repetitionCount: number;
  interval: number; // in days
  nextReviewDate: Date;
  lastReviewDate: Date;

  // Mastery metrics
  masteryScore: number;
  masteryHistory: { date: Date; score: number }[];

  // AI Card
  knowledgeCard?: IKnowledgeCard;
  isCardGenerated: boolean;

  // History
  reviews: IReviewAttempt[];
}

const RevisionItemSchema = new Schema<IRevisionItem>({
  userId: { type: String, required: true },
  problemId: { type: String, default: null },
  title: { type: String, required: true },
  platform: { type: String, required: true },
  url: { type: String, required: true },
  difficulty: { type: String, required: true },
  tags: [{ type: String }],
  pattern: { type: String, default: "" },
  source: { type: String, enum: ["library", "external"], required: true },
  personalNotes: { type: String, default: "" },

  // Performance signals
  confidence: { type: Number, required: true, min: 1, max: 5 },
  correctness: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
  hintsUsed: { type: Number, required: true },
  submissionCount: { type: Number, required: true },

  // SM-2
  easinessFactor: { type: Number, default: 2.5 },
  repetitionCount: { type: Number, default: 0 },
  interval: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now },
  lastReviewDate: { type: Date, default: Date.now },

  // Mastery
  masteryScore: { type: Number, default: 50 },
  masteryHistory: [
    {
      date: { type: Date, default: Date.now },
      score: { type: Number, required: true }
    }
  ],

  // AI Card
  knowledgeCard: {
    pattern: { type: String, default: "" },
    coreIdea: { type: String, default: "" },
    stateDefinition: { type: String, default: "" },
    transitionLogic: { type: String, default: "" },
    timeComplexity: { type: String, default: "" },
    spaceComplexity: { type: String, default: "" },
    commonMistakes: { type: String, default: "" },
    interviewInsights: { type: String, default: "" },
    relatedProblems: [{ type: String }]
  },
  isCardGenerated: { type: Boolean, default: false },

  // Reviews History
  reviews: [
    {
      date: { type: Date, default: Date.now },
      confidence: { type: Number, required: true },
      recalled: { type: String, enum: ["Yes", "Partially", "No"], required: true },
      interval: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

// Index for fast query by user and checking due status
RevisionItemSchema.index({ userId: 1, nextReviewDate: 1 });
RevisionItemSchema.index({ userId: 1, problemId: 1 });
RevisionItemSchema.index({ userId: 1, title: 1 });

export default mongoose.models.RevisionItem || mongoose.model<IRevisionItem>("RevisionItem", RevisionItemSchema);
