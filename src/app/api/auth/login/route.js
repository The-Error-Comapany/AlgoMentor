import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { generateAccessToken, generateRefreshToken } from "@/utils/generateToken";
import { POST as syncGlobalContests } from "@/app/api/sync/global/route";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 }
      );
    }

    // Check email verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: "Please verify your email first" },
        { status: 403 }
      );
    }

    // Match password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // Trigger background contest sync on login (fire-and-forget)
    syncGlobalContests(new Request("http://localhost/api/sync/global", { method: "POST" })).catch((err) =>
      console.error("Background sync on login failed:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
