import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Potd from "@/lib/models/Potd";
import { fetchLCPOTD } from "@/lib/adapters/leetcode";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current date string in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split("T")[0];
    
    let potds = await Potd.find({ date: todayStr });

    try {
      await Potd.collection.dropIndex("date_1");
      console.log("Dropped old unique index on date");
    } catch (e) {
      // ignore
    }
    
    // If today's POTDs aren't synced yet (expecting 2: LC and GFG), let's sync them now!
    if (potds.length < 2) {
      try {
        console.log(`POTDs for ${todayStr} not found in DB. Triggering fetch...`);
        
        const { fetchGFGPOTD } = await import("@/lib/adapters/geeksforgeeks");
        
        await Promise.allSettled([
          fetchLCPOTD().then(async (fetchedPotd) => {
            if (fetchedPotd) {
              const date = fetchedPotd.date;
              const tags = (fetchedPotd.question?.topicTags || []).map((t: any) => t.name);
              const url = fetchedPotd.link.startsWith("http") ? fetchedPotd.link : `https://leetcode.com${fetchedPotd.link}`;
              await Potd.findOneAndUpdate(
                { date, platform: "leetcode" },
                { date, platform: "leetcode", title: fetchedPotd.question?.title || "Daily Challenge", difficulty: fetchedPotd.question?.difficulty || "Medium", url, tags },
                { upsert: true, new: true }
              );
            }
          }),
          fetchGFGPOTD().then(async (potd) => {
            if (potd) {
              const date = potd.date.split(" ")[0];
              const tags = potd.tags?.topic_tags || [];
              await Potd.findOneAndUpdate(
                { date, platform: "geeksforgeeks" },
                { date, platform: "geeksforgeeks", title: potd.problem_name, difficulty: potd.difficulty, url: potd.problem_url, tags },
                { upsert: true, new: true }
              );
            }
          })
        ]);
        
        potds = await Potd.find({ date: todayStr });
      } catch (syncErr) {
        console.error("Failed to sync POTD on demand:", syncErr);
      }
    }
    
    // Final fallback: If today's POTD still isn't available, get the most recent POTDs.
    if (potds.length === 0) {
      const latestPotd = await Potd.findOne().sort({ date: -1 });
      if (latestPotd) {
        potds = await Potd.find({ date: latestPotd.date });
      }
    }

    return NextResponse.json(potds || []);
  } catch (error: any) {
    console.error("GET POTD error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
