"use server"
import { put } from "@vercel/blob";
import { prisma } from "./db";

export const uploadAudio = async (file: File) => {
  try {
    console.log("Uploading file:", file);

    if (!file) throw new Error("No file provided");
    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log("Blob URL:", blob.url);
    return blob.url;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export const createMeeting = async (url: string, projectId: string, filename: string) => {
  console.log("Creating meeting with URL:", url, "and projectId:", projectId , filename);
  if (!url || !projectId) {
    throw new Error("URL or projectId is missing");
  } 
  try {
    const meeting = await prisma.meeting.create({
      data: {
        name: filename,
        meetingUrl: url,
        status: "PROCESSING",
        project: {
          connect: { id: projectId },
        },
      },
    });

    console.log("Meeting created:", meeting);
    return meeting;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

export const allMeetings = async (projectId: string) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { projectId },
      include: { issues: true },
    });
    return meetings;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};
