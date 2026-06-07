import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import ChatSession from "@/lib/models/ChatSession";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = req.nextUrl.searchParams.get("userId");
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    
    if (sessionId) {
      const session = await ChatSession.findOne({ _id: sessionId, userId }).lean();
      return NextResponse.json({ success: true, session });
    }

    if (!userId) return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });

    const sessions = await ChatSession.find({ userId })
      .select("title lastUpdated")
      .sort({ lastUpdated: -1 })
      .lean();

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, sessionId, messages, title } = await req.json();

    if (!userId || !messages) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (sessionId) {
      // Update existing session
      const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId },
        { messages, lastUpdated: new Date() },
        { new: true }
      );
      return NextResponse.json({ success: true, sessionId: session._id, session });
    } else {
      // Create new session
      const session = await ChatSession.create({
        userId,
        title: title || "New Session",
        messages,
        lastUpdated: new Date()
      });
      return NextResponse.json({ success: true, sessionId: session._id, session });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const userId = req.nextUrl.searchParams.get("userId");
    if (!sessionId || !userId) {
      return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
    }
    await ChatSession.findOneAndDelete({ _id: sessionId, userId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
