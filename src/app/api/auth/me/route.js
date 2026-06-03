import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import UserStats from "@/lib/models/UserStats";
import Submission from "@/lib/models/Submission";
import TopicStat from "@/lib/models/TopicStat";

export async function GET(req) {
  try {
    await connectDB();

    let token;
    const authHeader = req.headers.get("authorization");

    // Check Authorization header
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    // If no token
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authorized, no token" },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from DB
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user,
      });
    } catch (err) {
      console.error("Token verification or DB user lookup error:", err);
      return NextResponse.json(
        { success: false, message: "Not authorized, token failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    let token;
    const authHeader = req.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authorized, no token" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const { name, email, lcHandle, cfHandle, weeklyGoalTarget, readAchievements, readContests } = await req.json();

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (lcHandle !== undefined) updateData.lcHandle = lcHandle;
      if (cfHandle !== undefined) updateData.cfHandle = cfHandle;
      if (weeklyGoalTarget !== undefined) updateData.weeklyGoalTarget = weeklyGoalTarget;
      if (readAchievements !== undefined) updateData.readAchievements = readAchievements.slice(-50);
      if (readContests !== undefined) updateData.readContests = readContests.slice(-50);

      if (lcHandle === "") {
        console.log(`Clearing LeetCode stats for unlinked user ${decoded.id}`);
        await UserStats.deleteMany({ userId: decoded.id, platform: "leetcode" });
        await Submission.deleteMany({ userId: decoded.id, platform: "leetcode" });
        await TopicStat.deleteMany({ userId: decoded.id, platform: "leetcode" });
      }
      if (cfHandle === "") {
        console.log(`Clearing Codeforces stats for unlinked user ${decoded.id}`);
        await UserStats.deleteMany({ userId: decoded.id, platform: "codeforces" });
        await Submission.deleteMany({ userId: decoded.id, platform: "codeforces" });
        await TopicStat.deleteMany({ userId: decoded.id, platform: "codeforces" });
      }

      const user = await User.findByIdAndUpdate(
        decoded.id,
        { $set: updateData },
        { new: true }
      ).select("-password");

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user,
      });
    } catch (err) {
      console.error("Token verification or DB user update error:", err);
      return NextResponse.json(
        { success: false, message: "Not authorized, token failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    let token;
    const authHeader = req.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authorized, no token" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Delete associated stats and submissions
      await UserStats.deleteMany({ userId: decoded.id });
      await Submission.deleteMany({ userId: decoded.id });
      await TopicStat.deleteMany({ userId: decoded.id });

      // Delete user
      await User.findByIdAndDelete(decoded.id);

      return NextResponse.json({
        success: true,
        message: "Account deleted successfully"
      });
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json(
        { success: false, message: "Not authorized, token failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
