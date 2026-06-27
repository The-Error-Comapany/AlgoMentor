import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import UserStats from "@/lib/models/UserStats";
import TopicStat from "@/lib/models/TopicStat";
import RevisionItem from "@/lib/models/RevisionItem";

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

/**
 * POST /api/mentor/chat
 * Body: { message: string, code?: string, mode: "chat" | "review" }
 *
 * Proxies to the Python FastAPI AI service or falls back to keyword-matched
 * responses when the service is unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, code, history, mode, userId } = body as {
      message: string;
      code?: string;
      history?: Array<{role: string, content: string}>;
      mode: "chat" | "review";
      userId?: string;
    };

    if (!message) {
      return NextResponse.json({ success: false, message: "Missing message" }, { status: 400 });
    }

    // --- Code Review Mode ---
    // Treat the submitted code as a "solution" and generate a card from it
    if (mode === "review" && code) {
      try {
        const res = await fetch(`${AI_SERVICE_URL}/generate-solution-card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Code Review",
            difficulty: "Medium",
            tags: ["code review"],
            programmingLanguage: "auto-detect",
            solutionCode: code,
          }),
        });

        if (!res.ok) throw new Error(`AI service status ${res.status}`);
        const card = await res.json();

        // Convert the structured card into a readable chat reply
        const reply = [
          `I've analyzed your code! Here's the breakdown:`,
          ``,
          `- **Pattern:** ${card.pattern}`,
          `- **Core Idea:** ${card.coreIdea}`,
          `- **Time Complexity:** ${card.timeComplexity}`,
          `- **Space Complexity:** ${card.spaceComplexity}`,
          `- **State / Key Structures:** ${card.stateDefinition}`,
          `- **Transition Logic:** ${card.transitionLogic}`,
          ``,
          `---`,
          ``,
          `**Common Mistakes:**`,
          `${card.commonMistakes}`,
          ``,
          `**Interview Insight:**`,
          `${card.interviewInsights}`,
          ``,
          `**Related Problems:**`,
          `- ${(card.relatedProblems || []).join("\n- ")}`
        ].join("\n");

        return NextResponse.json({ success: true, reply });
      } catch (err) {
        console.error("Mentor code review via AI service failed:", err);
        // Fall through to keyword fallback below
      }
    }

    // --- Chat Mode: AI generation ---
    if (mode === "chat") {
      try {
        let userContextStr = "";
        if (userId) {
          try {
            await connectDB();
            
            // 1. Fetch User Stats
            const stats = await UserStats.findOne({ userId });
            
            // 2. Fetch weak/strong topics
            const topics = await TopicStat.find({ userId }).sort({ count: -1 }).lean();
            const topTopics = topics.slice(0, 3).map(t => `${t.topic} (${t.count})`);
            
            // 3. Fetch Revision items that are due soon
            const revisionItems = await RevisionItem.find({ userId })
              .sort({ nextReviewDate: 1 })
              .limit(5)
              .lean();
              
            const dueItems = revisionItems.map(item => `- ${item.title} (${item.difficulty}) - Tags: ${item.tags.join(', ')}`);
            
            userContextStr = `
User Profile Context:
- Total Solved Problems: ${stats ? stats.solved || 0 : 0}
- Most Practiced Topics: ${topTopics.length > 0 ? topTopics.join(', ') : 'None yet'}
- High-Priority Revision Queue (Problems user struggles with or needs to review):
${dueItems.length > 0 ? dueItems.join('\n') : 'No items due right now.'}
            `.trim();
            
          } catch (dbErr) {
            console.error("Failed to fetch user context for mentor:", dbErr);
          }
        }

        const res = await fetch(`${AI_SERVICE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history, userContext: userContextStr }),
        });

        if (!res.ok) throw new Error(`AI service status ${res.status}`);
        const data = await res.json();
        return NextResponse.json({ success: true, reply: data.reply });
      } catch (err) {
        console.error("Mentor chat via AI service failed:", err);
        return NextResponse.json({ 
          success: false, 
          reply: "⚠️ The AI Mentor service is currently unreachable or encountered an error. Please make sure the Python backend (`python main.py`) is running!" 
        });
      }
    }

    return NextResponse.json({ success: false, message: "Invalid mode" }, { status: 400 });
  } catch (error: any) {
    console.error("Mentor chat route error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
