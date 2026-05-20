import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import generateOTP from "@/utils/otpGenerator";
import sendEmail from "@/utils/sendEmail";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

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

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    return NextResponse.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
