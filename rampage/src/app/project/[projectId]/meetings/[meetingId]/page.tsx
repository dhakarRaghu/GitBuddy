// app/[projectId]/meetings/[meetingId]/page.tsx
import React from 'react'
import IssuesList from '@/components/issues-list'
import { Metadata } from 'next'
import { fetchMeetingById } from '@/lib/uploadToVercel'

type Props = {
  params: Promise<{ projectId: string; meetingId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { meetingId } = await params
  return {
    title: `Meeting Details - ${meetingId}`,
    description: 'View details and issues for this meeting',
  }
}

export default async function MeetingDetailsPage({ params }: Props) {
  const { meetingId } = await params;
  
  let meeting;
  try {
    meeting = await fetchMeetingById(meetingId);
  } catch (error) {
    return <p className="text-red-500">Failed to load meeting details.</p>;
  }
  console.log(meeting)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Meeting Details</h1>
      <IssuesList meeting={meeting} />
    </div>
  );
}
