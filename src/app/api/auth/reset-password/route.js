import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    // Validate input
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP and new password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // BLOCK Google users
    if (user.googleId) {
      return NextResponse.json(
        { success: false, message: "Google accounts cannot reset password." },
        { status: 400 }
      );
    }

    // Check OTP
    if (user.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check expiry
    if (user.otpExpires < Date.now()) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 400 }
      );
    }

    // Update password (hashed by pre-save hook)
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
