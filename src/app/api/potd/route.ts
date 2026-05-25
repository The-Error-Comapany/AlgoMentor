import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Potd from "@/lib/models/Potd";
import { fetchLCPOTD } from "@/lib/adapters/leetcode";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current date string in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split("T")[0];
    
    let potd = await Potd.findOne({ date: todayStr });
    
    // If today's POTD isn't synced yet, let's sync it now!
    if (!potd) {
      try {
        console.log(`POTD for ${todayStr} not found in DB. Fetching from LeetCode...`);
        const fetchedPotd = await fetchLCPOTD();
        if (fetchedPotd) {
          const date = fetchedPotd.date; // already YYYY-MM-DD
          const tags = (fetchedPotd.question?.topicTags || []).map((t: any) => t.name);
          const url = fetchedPotd.link.startsWith("http")
            ? fetchedPotd.link
            : `https://leetcode.com${fetchedPotd.link}`;

          potd = await Potd.findOneAndUpdate(
            { date },
            {
              date,
              platform: "leetcode",
              title: fetchedPotd.question?.title || "Daily Challenge",
              difficulty: fetchedPotd.question?.difficulty || "Medium",
              url,
              tags,
            },
            { upsert: true, new: true }
          );
          console.log(`POTD for ${date} successfully synced on demand: ${potd.title}`);
        }
      } catch (syncErr) {
        console.error("Failed to sync POTD on demand:", syncErr);
      }
    }
    
    // Final fallback: If today's POTD still isn't available, get the most recent POTD.
    if (!potd) {
      potd = await Potd.findOne().sort({ date: -1 });
    }

    return NextResponse.json(potd || {});
  } catch (error: any) {
    console.error("GET POTD error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
