import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Contest from "@/lib/models/Contest";
import Potd from "@/lib/models/Potd";
import { fetchLCPOTD, fetchLCUpcomingContests } from "@/lib/adapters/leetcode";
import { fetchCFUpcomingContests } from "@/lib/adapters/codeforces";

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    await Promise.all([
      // 1. Sync LeetCode POTD
      fetchLCPOTD()
        .then(async (potd) => {
          if (!potd) return;

          const date = potd.date; // already YYYY-MM-DD
          const tags = (potd.question?.topicTags || []).map((t: any) => t.name);
          const url = potd.link.startsWith("http")
            ? potd.link
            : `https://leetcode.com${potd.link}`;

          await Potd.findOneAndUpdate(
            { date },
            {
              date,
              platform: "leetcode",
              title: potd.question?.title || "Daily Challenge",
              difficulty: potd.question?.difficulty || "Medium",
              url,
              tags,
            },
            { upsert: true, new: true }
          );
        })
        .catch((err) => {
          console.error("Error syncing LeetCode POTD:", err);
        }),

      // 2. Sync LeetCode Upcoming Contests
      fetchLCUpcomingContests()
        .then(async (contests) => {
          for (const c of contests) {
            const url = `https://leetcode.com/contest/${c.titleSlug}`;
            await Contest.findOneAndUpdate(
              { platform: "leetcode", slug: c.titleSlug },
              {
                platform: "leetcode",
                slug: c.titleSlug,
                name: c.title,
                startTime: new Date(c.startTime * 1000),
                duration: c.duration,
                url,
              },
              { upsert: true }
            );
          }
        })
        .catch((err) => {
          console.error("Error syncing LeetCode Contests:", err);
        }),

      // 3. Sync Codeforces Upcoming Contests
      fetchCFUpcomingContests()
        .then(async (contests) => {
          for (const c of contests) {
            const url = `https://codeforces.com/contests/${c.id}`;
            await Contest.findOneAndUpdate(
              { platform: "codeforces", slug: String(c.id) },
              {
                platform: "codeforces",
                slug: String(c.id),
                name: c.name,
                startTime: new Date(c.startTimeSeconds * 1000),
                duration: c.durationSeconds,
                url,
              },
              { upsert: true }
            );
          }
        })
        .catch((err) => {
          console.error("Error syncing Codeforces Contests:", err);
        }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Global sync route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
