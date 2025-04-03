// lib/uploadToVercel.ts
"use server"

import { put } from "@vercel/blob"
import { prisma } from "./db"
import { processMeeting } from "./assembly"

export const uploadAudio = async (file: File) => {
  try {
    console.log("Uploading file:", file)

    if (!file) throw new Error("No file provided")
    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log("Blob URL:", blob.url)
    return blob.url
  } catch (error) {
    console.error("Upload failed:", error)
    throw error
  }
}

export async function createMeeting(meetingUrl: string, projectId: string , fileName : string) {
  try {
    const meeting = await prisma.meeting.create({
      data: {
        name: fileName || "New Meeting", // You can make this dynamic based on user input
        meetingUrl,
        projectId, // Fixed: Ensure projectId is a string
        status: "PROCESSING",
      },
      include: {
        issues: true,
      },
    })

    // Trigger audio processing in the background
    processMeeting(meeting.id).catch(error => {
      console.error("Background processing failed:", error)
    })

    return meeting
  } catch (error) {
    console.error("Error creating meeting:", error)
    throw new Error("Failed to create meeting")
  }
}
export async function fetchMeetings(projectId: string) {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        projectId,
      },
      include: {
        issues: true, // Include related issues
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return meetings
  } catch (error) {
    console.error("Error fetching meetings:", error)
    throw new Error("Failed to fetch meetings")
  }
}

export async function fetchMeetingById(meetingId: string) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        issues: true,
      },
    })
    if (!meeting) {
      throw new Error("Meeting not found")
    }
    // return meeting
    return {
      ...meeting,
      issues: meeting.issues ?? [], // Ensure issues is always an array
    };
  } catch (error) {
    console.error("Error fetching meeting:", error)
    throw error
  }
}

export async function deleteMeeting(meetingId: string) {
  try {
    await prisma.meeting.delete({
      where: {
        id: meetingId,
      },
    })
  } catch (error) {
    console.error("Error deleting meeting:", error)
    throw new Error("Failed to delete meeting")
  }
}