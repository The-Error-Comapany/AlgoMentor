import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

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
