import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import UserStats from "@/lib/models/UserStats";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    const stats = await UserStats.find({ userId });
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("GET user stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
