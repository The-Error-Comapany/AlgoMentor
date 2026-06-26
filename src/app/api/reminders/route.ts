import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Reminder from "@/lib/models/Reminder";
import Contest from "@/lib/models/Contest";
import jwt from "jsonwebtoken";

const getUserIdFromAuth = (req: NextRequest): string | null => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const reminders = await Reminder.find({ userId });
    return NextResponse.json(reminders);
  } catch (error: any) {
    console.error("GET Reminders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { contestId } = await req.json();
    if (!contestId) {
      return NextResponse.json({ success: false, message: "contestId required" }, { status: 400 });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return NextResponse.json({ success: false, message: "Contest not found" }, { status: 404 });
    }

    // Set notification time to 1 hour before start
    const notifyAt = new Date(contest.startTime.getTime() - 60 * 60 * 1000);

    const reminder = await Reminder.findOneAndUpdate(
      { userId, contestId },
      {
        userId,
        contestId,
        contestSlug: contest.slug,
        platform: contest.platform,
        notifyAt,
        sent: false,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, reminder });
  } catch (error: any) {
    console.error("POST Reminder error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const contestId = url.searchParams.get("contestId");
    if (!contestId) {
      return NextResponse.json({ success: false, message: "contestId required" }, { status: 400 });
    }

    await Reminder.findOneAndDelete({ userId, contestId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Reminder error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
