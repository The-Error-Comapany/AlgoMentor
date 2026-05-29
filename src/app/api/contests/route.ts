import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Contest from "@/lib/models/Contest";
import { fetchLCUpcomingContests } from "@/lib/adapters/leetcode";
import { fetchCFUpcomingContests } from "@/lib/adapters/codeforces";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const now = new Date();
    
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Fetch upcoming and recently started contests
    let contests = await Contest.find({ startTime: { $gte: lastWeek } })
      .sort({ startTime: 1 });

    // Check if we need to sync: we do a sync if we have no upcoming contests in the database
    // for either platform.
    const hasLC = contests.some((c: any) => c.platform === "leetcode");
    const hasCF = contests.some((c: any) => c.platform === "codeforces");

    if (!hasLC || !hasCF) {
      try {
        console.log(`Upcoming contests missing (hasLC: ${hasLC}, hasCF: ${hasCF}). Fetching and syncing on demand...`);
        const syncPromises: Promise<any>[] = [];

        if (!hasLC) {
          syncPromises.push(
            fetchLCUpcomingContests()
              .then(async (lcContests) => {
                for (const c of lcContests) {
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
                console.log("LeetCode contests synced successfully.");
              })
              .catch((err) => {
                console.error("Error syncing LeetCode contests on-demand:", err);
              })
          );
        }

        if (!hasCF) {
          syncPromises.push(
            fetchCFUpcomingContests()
              .then(async (cfContests) => {
                for (const c of cfContests) {
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
                console.log("Codeforces contests synced successfully.");
              })
              .catch((err) => {
                console.error("Error syncing Codeforces contests on-demand:", err);
              })
          );
        }

        if (syncPromises.length > 0) {
          await Promise.all(syncPromises);
          // Re-fetch upcoming contests after syncing
          contests = await Contest.find({ startTime: { $gte: lastWeek } })
            .sort({ startTime: 1 });
        }
      } catch (syncErr) {
        console.error("Failed to sync contests on demand:", syncErr);
      }
    }

    return NextResponse.json(contests);
  } catch (error: any) {
    console.error("GET contests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
