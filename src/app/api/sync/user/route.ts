import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import UserStats from "@/lib/models/UserStats";
import Submission from "@/lib/models/Submission";
import TopicStat from "@/lib/models/TopicStat";
import {
  fetchLCStats,
  fetchLCTopics,
  fetchLCSubmissions,
  fetchLCContestRating,
} from "@/lib/adapters/leetcode";
import {
  fetchCFUser,
  fetchCFRatingHistory,
  fetchCFSubmissions,
  computeCFTopicStats,
} from "@/lib/adapters/codeforces";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, lcHandle, cfHandle } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const syncPromises: Promise<any>[] = [];

    // LeetCode sync if lcHandle is provided
    if (lcHandle && lcHandle.trim() !== "") {
      const lcSync = Promise.all([
        fetchLCStats(lcHandle).catch((err) => {
          console.error(`Error fetching LC Stats for ${lcHandle}:`, err);
          return null;
        }),
        fetchLCTopics(lcHandle).catch((err) => {
          console.error(`Error fetching LC Topics for ${lcHandle}:`, err);
          return null;
        }),
        fetchLCSubmissions(lcHandle, 10).catch((err) => {
          console.error(`Error fetching LC Submissions for ${lcHandle}:`, err);
          return [];
        }),
        fetchLCContestRating(lcHandle).catch((err) => {
          console.error(`Error fetching LC Contest Rating for ${lcHandle}:`, err);
          return null;
        }),
      ]).then(async ([stats, topics, submissions, contestRating]) => {
        if (!stats) return;

        // 1. Solved counts per difficulty
        const acNums = stats.submitStats?.acSubmissionNum || [];
        const solved = acNums.find((n: any) => n.difficulty === "All")?.count || 0;
        const easySolved = acNums.find((n: any) => n.difficulty === "Easy")?.count || 0;
        const mediumSolved = acNums.find((n: any) => n.difficulty === "Medium")?.count || 0;
        const hardSolved = acNums.find((n: any) => n.difficulty === "Hard")?.count || 0;

        const rating = contestRating?.rating ? Math.round(contestRating.rating) : undefined;
        const ranking = stats.profile?.ranking || undefined;
        const contestsAttended = contestRating?.attendedContestsCount || 0;

        // Upsert UserStats
        await UserStats.findOneAndUpdate(
          { userId, platform: "leetcode" },
          {
            userId,
            platform: "leetcode",
            solved,
            easySolved,
            mediumSolved,
            hardSolved,
            rating,
            ranking,
            contestsAttended,
            lastSynced: new Date(),
          },
          { upsert: true, new: true }
        );

        // 2. Topic Stats
        if (topics) {
          const mergedTopics = [
            ...(topics.fundamental || []),
            ...(topics.intermediate || []),
            ...(topics.advanced || []),
          ];

          for (const t of mergedTopics) {
            await TopicStat.findOneAndUpdate(
              { userId, platform: "leetcode", topic: t.tagName },
              {
                userId,
                platform: "leetcode",
                topic: t.tagName,
                count: t.problemsSolved || 0,
              },
              { upsert: true }
            );
          }
        }

        // 3. Submissions
        for (const sub of submissions) {
          await Submission.findOneAndUpdate(
            { userId, platform: "leetcode", titleSlug: sub.titleSlug },
            {
              userId,
              platform: "leetcode",
              title: sub.title,
              titleSlug: sub.titleSlug,
              verdict: "Accepted",
              language: sub.lang,
              timestamp: new Date(sub.timestamp * 1000),
            },
            { upsert: true }
          );
        }
      });

      syncPromises.push(lcSync);
    }

    // Codeforces sync if cfHandle is provided
    if (cfHandle && cfHandle.trim() !== "") {
      const cfSync = Promise.all([
        fetchCFUser(cfHandle).catch((err) => {
          console.error(`Error fetching CF User info for ${cfHandle}:`, err);
          return null;
        }),
        fetchCFRatingHistory(cfHandle).catch((err) => {
          console.error(`Error fetching CF Rating History for ${cfHandle}:`, err);
          return [];
        }),
        fetchCFSubmissions(cfHandle, 20).catch((err) => {
          console.error(`Error fetching CF Submissions for ${cfHandle}:`, err);
          return [];
        }),
        computeCFTopicStats(cfHandle).catch((err) => {
          console.error(`Error computing CF Topic Stats for ${cfHandle}:`, err);
          return {};
        }),
      ]).then(async ([user, ratingHistory, submissions, topicStats]) => {
        if (!user) return;

        // 1. Process Rating History & UserStats
        const formattedHistory = (ratingHistory || []).map((h: any) => ({
          contestName: h.contestName,
          rating: h.newRating,
          date: new Date(h.ratingUpdateTimeSeconds * 1000),
        }));

        await UserStats.findOneAndUpdate(
          { userId, platform: "codeforces" },
          {
            userId,
            platform: "codeforces",
            rating: user.rating,
            maxRating: user.maxRating,
            rank: user.rank,
            ratingHistory: formattedHistory,
            lastSynced: new Date(),
          },
          { upsert: true, new: true }
        );

        // 2. Topic Stats
        for (const [topic, count] of Object.entries(topicStats)) {
          await TopicStat.findOneAndUpdate(
            { userId, platform: "codeforces", topic },
            {
              userId,
              platform: "codeforces",
              topic,
              count,
            },
            { upsert: true }
          );
        }

        // 3. Submissions
        for (const sub of submissions) {
          if (!sub.problem) continue;
          const titleSlug = `${sub.problem.contestId}-${sub.problem.index}`;
          await Submission.findOneAndUpdate(
            { userId, platform: "codeforces", titleSlug },
            {
              userId,
              platform: "codeforces",
              title: sub.problem.name,
              titleSlug,
              verdict: sub.verdict,
              language: sub.programmingLanguage,
              timestamp: new Date(sub.creationTimeSeconds * 1000),
            },
            { upsert: true }
          );
        }
      });

      syncPromises.push(cfSync);
    }

    if (syncPromises.length > 0) {
      await Promise.all(syncPromises);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("User sync route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
