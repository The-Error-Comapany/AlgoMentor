import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import generateOTP from "@/utils/otpGenerator";
import sendEmail from "@/utils/sendEmail";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
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
        {
          success: false,
          message: "This account uses Google login. Please sign in with Google.",
        },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP to reset password is ${otp}. It will expire in 10 minutes.`,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset OTP sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
