import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Potd from "@/lib/models/Potd";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current date string in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split("T")[0];
    
    let potd = await Potd.findOne({ date: todayStr });
    
    // Fallback: If today's POTD isn't synced yet, get the most recent POTD.
    if (!potd) {
      potd = await Potd.findOne().sort({ date: -1 });
    }

    return NextResponse.json(potd || {});
  } catch (error: any) {
    console.error("GET POTD error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
