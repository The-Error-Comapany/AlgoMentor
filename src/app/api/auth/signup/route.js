import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import generateOTP from "@/utils/otpGenerator";
import sendEmail from "@/utils/sendEmail";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    let user;

    if (userExists) {
      if (userExists.googleId) {
        return NextResponse.json(
          {
            success: false,
            message: "This email is registered with Google. Please sign in with Google.",
          },
          { status: 400 }
        );
      }

      if (userExists.isEmailVerified) {
        return NextResponse.json(
          { success: false, message: "User already exists" },
          { status: 400 }
        );
      }

      userExists.name = name;
      userExists.password = password;
      userExists.otp = otp;
      userExists.otpExpires = otpExpires;
      await userExists.save();
      user = userExists;
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        otp,
        otpExpires,
        isEmailVerified: false,
      });
    }

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Verify OTP.",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
