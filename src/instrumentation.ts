export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("Initializing background contest synchronization...");
    
    // Initial fetch when server starts
    const syncContests = async () => {
      try {
        console.log("Running scheduled contest synchronization...");
        // Assuming your backend is running on localhost during dev/prod 
        // Note: For a real production app, hitting your own API inside instrumentation can be tricky 
        // if the server isn't fully ready, so we use a small delay or call the function directly.
        const { fetchLCPOTD, fetchLCUpcomingContests } = await import("@/lib/adapters/leetcode");
        const { fetchCFUpcomingContests } = await import("@/lib/adapters/codeforces");
        const { connectDB } = await import("@/lib/db/mongoose");
        const Contest = (await import("@/lib/models/Contest")).default;
        const Potd = (await import("@/lib/models/Potd")).default;
        
        await connectDB();

        // 1. Sync LeetCode POTD
        fetchLCPOTD()
          .then(async (potd: any) => {
            if (!potd) return;
            const date = potd.date;
            const tags = (potd.question?.topicTags || []).map((t: any) => t.name);
            const url = potd.link.startsWith("http") ? potd.link : `https://leetcode.com${potd.link}`;

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
          .catch((err: any) => console.error("Error syncing LeetCode POTD:", err));

        // 2. Sync LeetCode Upcoming Contests
        fetchLCUpcomingContests()
          .then(async (contests: any) => {
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
                  endTime: new Date((c.startTime + c.duration) * 1000),
                },
                { upsert: true }
              );
            }
          })
          .catch((err: any) => console.error("Error syncing LeetCode Contests:", err));

        // 3. Sync Codeforces Upcoming Contests
        fetchCFUpcomingContests()
          .then(async (contests: any) => {
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
                  endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000),
                },
                { upsert: true }
              );
            }
          })
          .catch((err: any) => console.error("Error syncing Codeforces Contests:", err));

      } catch (error) {
        console.error("Background sync error:", error);
      }
    };

    // Delay initial sync by 10 seconds to ensure DB and app are ready
    setTimeout(() => {
      syncContests();
    }, 10000);

    // Then run every 6 hours
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    setInterval(() => {
      syncContests();
    }, SIX_HOURS);
  }
}
