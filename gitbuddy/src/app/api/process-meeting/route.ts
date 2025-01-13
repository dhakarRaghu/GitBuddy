import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processMeeting } from "~/lib/assembly";
import { db } from "~/server/db";

const bodyParser = z.object({
  meetingUrl: z.string().url(),
  projectId: z.string(),
  meetingId: z.string()
});

export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { meetingUrl, projectId, meetingId } = bodyParser.parse(body);
    console.log("Parsed body:", { meetingUrl, projectId, meetingId });

    const { transcript, summaries } = await processMeeting(meetingUrl);
    console.log("Processed meeting:", { transcriptLength: transcript.length, summariesCount: summaries.length });

    if (!summaries || summaries.length === 0) {
      throw new Error("No summaries generated from the meeting");
    }

    await db.issue.createMany({
      data: summaries.map(summary => ({
        start: summary.start,
        end: summary.end,
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
        meetingId
      }))
    });

    await db.meeting.update({
      where: { id: meetingId },
      data: { 
        status: "COMPLETED",
        name: summaries[0]!.headline,
        // transcript: transcript
      }
    });

    console.log('Meeting Processed and summary created', { meetingId, summariesCount: summaries.length });

    return NextResponse.json({ success: true, summariesCount: summaries.length }, { status: 200 });
  } catch (error) {
    console.error('Error processing meeting:', error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

