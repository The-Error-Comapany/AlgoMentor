import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
      
      const { currentPassword, newPassword } = await req.json();

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Please provide both current and new passwords" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const user = await User.findById(decoded.id);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      if (user.googleId) {
        return NextResponse.json(
          { success: false, message: "Google accounts do not have passwords. Please use Google Sign-In." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password" },
          { status: 401 }
        );
      }

      user.password = newPassword;
      await user.save(); // The pre-save hook in User model will hash the new password

      return NextResponse.json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (err) {
      console.error("Token verification error:", err);
      return NextResponse.json(
        { success: false, message: "Not authorized, token failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
