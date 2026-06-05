import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };
    return decoded.id;
  } catch (err) {
    return null;
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { maxReviewsPerDay } = body;

    if (maxReviewsPerDay === undefined || typeof maxReviewsPerDay !== "number" || maxReviewsPerDay <= 0) {
      return NextResponse.json({ success: false, message: "Invalid maxReviewsPerDay limit value" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { maxReviewsPerDay } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Daily review limit updated successfully",
      maxReviewsPerDay: updatedUser.maxReviewsPerDay
    });

  } catch (error: any) {
    console.error("PUT limit route error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
