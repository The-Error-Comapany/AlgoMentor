import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/utils/db";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/utils/generateToken";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Check refresh token exists
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token found" },
        { status: 401 }
      );
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.id);

      return NextResponse.json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
