import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Submission from "@/lib/models/Submission";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const limitParam = searchParams.get("limit");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const submissions = await Submission.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error("GET user submissions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
