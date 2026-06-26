import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Reminder from "@/lib/models/Reminder";
import User from "@/models/User";
import Contest from "@/lib/models/Contest";
import sendEmail from "@/utils/sendEmail";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Ideally, secure this endpoint with a cron secret key
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn("Unauthorized attempt to trigger reminder cron");
    // Depending on your setup, you might want to return 401
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    
    // Find reminders that need to be sent (notifyAt is in the past)
    const now = new Date();
    const remindersToSend = await Reminder.find({
      sent: false,
      notifyAt: { $lte: now }

    })
      .populate("userId", "name email")
      .populate("contestId", "name platform startTime url duration");

    let sentCount = 0;

    for (const reminder of remindersToSend) {
      const user = reminder.userId as any;
      const contest = reminder.contestId as any;

      if (!user || !contest || !user.email) {
        // Delete if invalid
        await reminder.deleteOne();
        continue;
      }

      // Calculate time until contest in hours/minutes
      const diffMs = contest.startTime.getTime() - now.getTime();
      let timeString = "soon";
      if (diffMs > 0) {
        const diffMins = Math.round(diffMs / 60000);
        if (diffMins >= 60) {
          timeString = `in about ${Math.round(diffMins / 60)} hour(s)`;
        } else {
          timeString = `in ${diffMins} minutes`;
        }
      }

      const emailSubject = `Reminder: ${contest.name} starts ${timeString}!`;
      const emailText = `
Hi ${user.name},

This is a reminder that the contest "${contest.name}" on ${contest.platform} is starting ${timeString}.

Contest Details:
- Start Time: ${new Date(contest.startTime).toLocaleString()}
- Duration: ${Math.round(contest.duration / 60)} minutes
- Link: ${contest.url}

Good luck and happy coding!

AlgoMentor Team
      `.trim();

      try {
        await sendEmail({
          to: user.email,
          subject: emailSubject,
          text: emailText,
        });

        // Delete after successfully sending
        await reminder.deleteOne();
        sentCount++;
        console.log(`Sent reminder email and deleted record for ${user.email} for contest ${contest.slug}`);
      } catch (err: any) {
        console.error(`Failed to send reminder to ${user.email}:`, err.message);
      }
    }

    return NextResponse.json({ success: true, processed: remindersToSend.length, sent: sentCount });
  } catch (error: any) {
    console.error("Reminder cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
