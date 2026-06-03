import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Contest from "@/lib/models/Contest";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const now = new Date();
    
    // Fetch upcoming and running contests (where endTime is in the future)
    const contests = await Contest.find({ endTime: { $gte: now } })
      .sort({ startTime: 1 });

    return NextResponse.json(contests);
  } catch (error: any) {
    console.error("GET contests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
