import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { generateAccessToken, generateRefreshToken } from "@/utils/generateToken";
import { OAuth2Client } from "google-auth-library";
import { POST as syncGlobalContests } from "@/app/api/sync/global/route";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    await connectDB();
    const { tokenId } = await req.json();

    // Validate token
    if (!tokenId) {
      return NextResponse.json(
        { success: false, message: "Google token is required" },
        { status: 400 }
      );
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Google account email not found" },
        { status: 400 }
      );
    }

    // Check existing user
    let user = await User.findOne({ email });

    // CASE 1: Email exists but created using normal signup
    if (user && !user.googleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Account already exists with email/password. Please login normally.",
        },
        { status: 400 }
      );
    }

    // CASE 2: First-time Google login → create user
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        isEmailVerified: true,
        password: undefined, // better than dummy password
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // Trigger background contest sync on login (fire-and-forget)
    syncGlobalContests(new Request(new URL("/api/sync/global", req.url), { method: "POST" })).catch((err) =>
      console.error("Background sync on login failed:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Google login successful",
      accessToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
