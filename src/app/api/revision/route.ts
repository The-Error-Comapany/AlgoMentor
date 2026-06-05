import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import RevisionItem from "@/lib/models/RevisionItem";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { generateRevisionCard } from "@/lib/aiService";

// Helper to get authenticated User ID from JWT
function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };
    return decoded.id;
  } catch (err) {
    return null;
  }
}

// GET all revision items and calculate analytics/queues
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user for maxReviewsPerDay limit
    const user = await User.findById(userId);
    const maxReviewsPerDay = user?.maxReviewsPerDay || 10;

    // Fetch all revision items for this user
    const items = await RevisionItem.find({ userId }).lean();
    const now = new Date();

    // 1. Calculate Topic Scores (average mastery score per tag)
    const topicStatsMap: { [key: string]: { totalMastery: number; count: number } } = {};
    let totalMasterySum = 0;
    let completedTodayCount = 0;

    // Determine start of today (local or UTC) for reviews completed count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    items.forEach((item: any) => {
      totalMasterySum += item.masteryScore || 0;
      
      // Calculate how many reviews were completed today
      if (item.reviews && item.reviews.length > 0) {
        const lastReview = item.reviews[item.reviews.length - 1];
        if (new Date(lastReview.date) >= startOfToday) {
          completedTodayCount++;
        }
      }

      // Add to tag grouping
      const tagsList = item.tags || [];
      tagsList.forEach((tag: string) => {
        const cleanTag = tag.trim().toLowerCase();
        if (!topicStatsMap[cleanTag]) {
          topicStatsMap[cleanTag] = { totalMastery: 0, count: 0 };
        }
        topicStatsMap[cleanTag].totalMastery += item.masteryScore || 0;
        topicStatsMap[cleanTag].count += 1;
      });
    });

    const overallReadinessScore = items.length > 0 ? Math.round(totalMasterySum / items.length) : 0;

    // Format Topic Scores (0-100)
    const topicScores: { [key: string]: number } = {};
    const weakTopics: string[] = [];

    Object.keys(topicStatsMap).forEach((topic) => {
      const stats = topicStatsMap[topic];
      const avgMastery = Math.round(stats.totalMastery / stats.count);
      topicScores[topic] = avgMastery;
      
      // If average mastery score is below 60, identify as a weak topic
      if (avgMastery < 60) {
        weakTopics.push(topic);
      }
    });

    // 2. Calculate dynamic Priority Scores for sorting
    const itemsWithPriority = items.map((item: any) => {
      // a) SM2Urgency
      const nextReview = new Date(item.nextReviewDate);
      const diffTime = now.getTime() - nextReview.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      let sm2Urgency = 0;
      if (diffDays >= 0) {
        // Linearly increase urgency to 100 over 5 days overdue
        sm2Urgency = Math.min(100, diffDays * 20);
      }

      // b) Topic Weakness
      let totalTopicWeakness = 0;
      const tagsList = item.tags || [];
      tagsList.forEach((tag: string) => {
        const cleanTag = tag.trim().toLowerCase();
        const score = topicScores[cleanTag] !== undefined ? topicScores[cleanTag] : 80;
        totalTopicWeakness += (100 - score);
      });
      const topicWeakness = tagsList.length > 0 ? (totalTopicWeakness / tagsList.length) : 20;

      // c) Interview Boost
      const highFrequencyTags = ["arrays", "strings", "trees", "graphs", "dp", "dynamic programming", "sliding window", "binary search", "backtracking", "heap"];
      const hasHighFreqTag = tagsList.some((tag: string) => highFrequencyTags.includes(tag.toLowerCase()));
      const interviewBoost = hasHighFreqTag ? 100 : 50;

      // d) Difficulty Score
      let difficultyScore = 50;
      const diff = String(item.difficulty).toLowerCase();
      if (diff === "easy") difficultyScore = 30;
      else if (diff === "medium") difficultyScore = 70;
      else if (diff === "hard") difficultyScore = 100;
      else {
        // Parse Codeforces numeric difficulty rating
        const numDiff = parseInt(item.difficulty);
        if (!isNaN(numDiff)) {
          if (numDiff < 1200) difficultyScore = 30;
          else if (numDiff < 1600) difficultyScore = 70;
          else difficultyScore = 100;
        }
      }

      // Priority Score = 0.4 * SM2Urgency + 0.3 * TopicWeakness + 0.2 * InterviewBoost + 0.1 * Difficulty
      const priorityScore = Math.round(
        0.4 * sm2Urgency + 
        0.3 * topicWeakness + 
        0.2 * interviewBoost + 
        0.1 * difficultyScore
      );

      return {
        ...item,
        priorityScore
      };
    });

    // 3. Filter and partition into Queues
    const allDueItems = itemsWithPriority.filter((item: any) => {
      const nextReview = new Date(item.nextReviewDate);
      return nextReview <= now;
    });

    // Sort by Priority Score descending
    allDueItems.sort((a, b) => b.priorityScore - a.priorityScore);

    // Limit "Due Today" queue to user's daily limit
    const dueToday = allDueItems.slice(0, maxReviewsPerDay);

    return NextResponse.json({
      success: true,
      dueToday,
      allRevisionItems: itemsWithPriority,
      overallReadinessScore,
      topicScores,
      weakTopics,
      completedTodayCount,
      maxReviewsPerDay,
      totalDueCount: allDueItems.length
    });

  } catch (error: any) {
    console.error("GET revision items error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Add a solved problem to the Revision Hub
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      problemId,
      title,
      platform,
      url,
      difficulty,
      tags,
      pattern,
      source,
      confidence, // 1-5
      correctness, // boolean
      timeTaken, // minutes
      hintsUsed, // number
      submissionCount
    } = body;

    if (!title || !platform || !url || !difficulty || confidence === undefined || correctness === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if problem is already added
    const existing = await RevisionItem.findOne({ userId, title });
    if (existing) {
      return NextResponse.json({ success: false, message: "Problem is already in Revision Hub" }, { status: 400 });
    }

    // Calculate Mastery Score
    const confScore = ((confidence - 1) / 4) * 100; // maps 1-5 to 0-100
    const corrScore = correctness ? 100 : 0;
    const hintScore = Math.max(0, 100 - (hintsUsed * 25));

    // Target Time based on difficulty
    let targetTime = 30; // default
    const diffStr = String(difficulty).toLowerCase();
    if (diffStr === "easy") targetTime = 15;
    else if (diffStr === "medium") targetTime = 35;
    else if (diffStr === "hard") targetTime = 50;
    else {
      const parsedCf = parseInt(difficulty);
      if (!isNaN(parsedCf)) {
        targetTime = parsedCf < 1200 ? 15 : parsedCf < 1600 ? 35 : 50;
      }
    }

    const timeScore = timeTaken <= targetTime ? 100 : Math.max(0, 100 - (timeTaken - targetTime) * 4);
    const masteryScore = Math.round(
      0.4 * confScore + 
      0.3 * corrScore + 
      0.2 * hintScore + 
      0.1 * timeScore
    );

    // SM-2 Initial Parameters
    // We derive quality q from confidence
    let q = 3;
    if (confidence >= 4) q = 5;
    else if (confidence === 3) q = 3;
    else q = 1;

    let interval = 1; // day
    let repetitionCount = 0;
    let easinessFactor = 2.5;

    if (q >= 3) {
      interval = 1;
      repetitionCount = 1;
    } else {
      interval = 1;
      repetitionCount = 0;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Create the revision item
    const newItem = new RevisionItem({
      userId,
      problemId: problemId || null,
      title,
      platform,
      url,
      difficulty,
      tags: tags || [],
      pattern: pattern || "",
      source,
      confidence,
      correctness,
      timeTaken,
      hintsUsed,
      submissionCount: submissionCount || 1,
      easinessFactor,
      repetitionCount,
      interval,
      nextReviewDate,
      lastReviewDate: new Date(),
      masteryScore,
      masteryHistory: [{ date: new Date(), score: masteryScore }]
    });

    // Generate AI Knowledge Card inline (so it is saved immediately)
    try {
      const card = await generateRevisionCard(title, difficulty, tags || []);
      newItem.knowledgeCard = card;
      newItem.isCardGenerated = true;
      if (card.pattern && !newItem.pattern) {
        newItem.pattern = card.pattern;
      }
    } catch (err) {
      console.error("AI card generation failed on add problem:", err);
    }

    await newItem.save();

    return NextResponse.json({
      success: true,
      message: "Problem successfully added to Revision Hub",
      item: newItem
    });

  } catch (error: any) {
    console.error("POST revision item error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Update revision item after a review session
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      recall, // "Yes" | "Partially" | "No"
      confidence, // optional updated signals
      correctness,
      timeTaken,
      hintsUsed,
      submissionCount
    } = body;

    if (!id || !recall) {
      return NextResponse.json({ success: false, message: "Missing id or recall value" }, { status: 400 });
    }

    const item = await RevisionItem.findOne({ _id: id, userId });
    if (!item) {
      return NextResponse.json({ success: false, message: "Revision item not found" }, { status: 404 });
    }

    // 1. Calculate Quality q for SM-2
    let q = 3;
    if (recall === "Yes") q = 5;
    else if (recall === "Partially") q = 3;
    else q = 1; // No

    // 2. SM-2 calculation
    let newEF = item.easinessFactor;
    let newRepetition = item.repetitionCount;
    let newInterval = item.interval;

    if (q >= 3) {
      newEF = newEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      newEF = Math.max(1.3, newEF);

      if (newRepetition === 0) {
        newInterval = 1;
      } else if (newRepetition === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.ceil(newInterval * newEF);
      }
      newRepetition += 1;
    } else {
      newRepetition = 0;
      newInterval = 1;
      // Slight reduction to EF if forgot
      newEF = Math.max(1.3, newEF - 0.2);
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update SM-2 parameters
    item.easinessFactor = newEF;
    item.repetitionCount = newRepetition;
    item.interval = newInterval;
    item.nextReviewDate = nextReviewDate;
    item.lastReviewDate = new Date();

    // 3. Log attempt
    item.reviews.push({
      date: new Date(),
      confidence: confidence || item.confidence,
      recalled: recall,
      interval: newInterval
    });

    // 4. Update Performance Signals and Mastery Score if provided (e.g. if re-solved)
    if (confidence !== undefined || correctness !== undefined || timeTaken !== undefined || hintsUsed !== undefined) {
      const currentConf = confidence !== undefined ? confidence : item.confidence;
      const currentCorr = correctness !== undefined ? correctness : item.correctness;
      const currentTime = timeTaken !== undefined ? timeTaken : item.timeTaken;
      const currentHints = hintsUsed !== undefined ? hintsUsed : item.hintsUsed;
      const currentSub = submissionCount !== undefined ? submissionCount : item.submissionCount;

      item.confidence = currentConf;
      item.correctness = currentCorr;
      item.timeTaken = currentTime;
      item.hintsUsed = currentHints;
      item.submissionCount = currentSub;

      // Recalculate Mastery Score
      const confScore = ((currentConf - 1) / 4) * 100;
      const corrScore = currentCorr ? 100 : 0;
      const hintScore = Math.max(0, 100 - (currentHints * 25));

      let targetTime = 30;
      const diffStr = String(item.difficulty).toLowerCase();
      if (diffStr === "easy") targetTime = 15;
      else if (diffStr === "medium") targetTime = 35;
      else if (diffStr === "hard") targetTime = 50;
      else {
        const parsedCf = parseInt(item.difficulty);
        if (!isNaN(parsedCf)) {
          targetTime = parsedCf < 1200 ? 15 : parsedCf < 1600 ? 35 : 50;
        }
      }

      const timeScore = currentTime <= targetTime ? 100 : Math.max(0, 100 - (currentTime - targetTime) * 4);
      const newMasteryScore = Math.round(
        0.4 * confScore + 
        0.3 * corrScore + 
        0.2 * hintScore + 
        0.1 * timeScore
      );

      item.masteryScore = newMasteryScore;
      item.masteryHistory.push({ date: new Date(), score: newMasteryScore });
    }

    await item.save();

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      item
    });

  } catch (error: any) {
    console.error("PUT revision item error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove a problem from the Revision Hub
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing problem id parameter" }, { status: 400 });
    }

    const deleted = await RevisionItem.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Revision item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Problem removed from Revision Hub"
    });

  } catch (error: any) {
    console.error("DELETE revision item error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
