// lib/assembly-ai.ts
"use server"

import { AssemblyAI } from 'assemblyai'
import { prisma } from './db'

// Define or import MeetingStatus
enum MeetingStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

function msToTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export async function processMeeting(meetingId: string) {
  try {
    // Fetch the meeting to get the meetingUrl
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting || !meeting.meetingUrl) {
      throw new Error('Meeting or meeting URL not found')
    }

    console.log("Starting transcription for:", meeting.meetingUrl)

    const transcript = await client.transcripts.transcribe({
      audio: meeting.meetingUrl,
      auto_chapters: true,
    })

    console.log("Transcription completed. Transcript length:", transcript.text?.length)

    if (!transcript.text) {
      throw new Error('No transcript found')
    }

    const summaries = transcript.chapters?.map(chapter => ({
      start: msToTime(chapter.start),
      end: msToTime(chapter.end),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary,
    })) || []

    console.log("Summaries generated:", summaries.length)

    // Create Issue records in the database
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: MeetingStatus.COMPLETED,
        issues: {
          create: summaries.map(summary => ({
            start: summary.start,
            end: summary.end,
            gist: summary.gist,
            headline: summary.headline,
            summary: summary.summary,
          })),
        },
      },
    })

    return {
      transcript: transcript.text,
      summaries,
    }
  } catch (error) {
    console.error('Error in processMeeting:', error)
    // Update meeting status to failed if processing fails
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: MeetingStatus.PROCESSING }, // You might want a FAILED status in the enum
    })
    throw error
  }
}