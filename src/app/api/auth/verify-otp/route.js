import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { generateAccessToken, generateRefreshToken } from "@/utils/generateToken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find user (with normalized lowercase email)
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: "Email already verified" },
        { status: 400 }
      );
    }

    // Check OTP match
    if (user.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (user.otpExpires < Date.now()) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 400 }
      );
    }

    // Mark email verified & clear OTP
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      accessToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
