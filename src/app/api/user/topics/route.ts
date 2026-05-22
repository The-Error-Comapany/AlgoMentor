import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import TopicStat from "@/lib/models/TopicStat";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    const topics = await TopicStat.find({ userId });
    return NextResponse.json(topics);
  } catch (error: any) {
    console.error("GET user topics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
