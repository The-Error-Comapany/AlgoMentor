import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import RevisionItem from "@/lib/models/RevisionItem";
import jwt from "jsonwebtoken";
import { generateRevisionCard } from "@/lib/aiService";

function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };
    return decoded.id;
  } catch (err) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing revision item id" }, { status: 400 });
    }

    const item = await RevisionItem.findOne({ _id: id, userId });
    if (!item) {
      return NextResponse.json({ success: false, message: "Revision item not found" }, { status: 404 });
    }

    // Generate the card using Hugging Face or Heuristics fallback
    const card = await generateRevisionCard(item.title, item.difficulty, item.tags || []);
    
    item.knowledgeCard = card;
    item.isCardGenerated = true;
    if (card.pattern && !item.pattern) {
      item.pattern = card.pattern;
    }
    
    await item.save();

    return NextResponse.json({
      success: true,
      message: "AI Revision Card generated successfully",
      item
    });

  } catch (error: any) {
    console.error("AI Card generate route error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
