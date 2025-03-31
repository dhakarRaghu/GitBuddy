// app/[projectId]/page.tsx
"use server"

import MeetingsList from "@/components/meetings-list"
import UploadAudio from "@/components/upload-audio"
import { fetchMeetings } from "@/lib/uploadToVercel"

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function Home({ params }: Props) {
  const { projectId } = await params
  const rawMeetings = await fetchMeetings(projectId)
  const meetings = rawMeetings.map(meeting => ({
    ...meeting,
    issue: meeting.issues.map(issue => ({
      id: issue.id,
      start: issue.start,
      end: issue.end,
      gist: issue.gist,
      headline: issue.headline,
      summary: issue.summary,
    })),
    createdAt: meeting.createdAt.toISOString(),
    updatedAt: meeting.updatedAt.toISOString(),
  }))

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Upload Audio</h2>
          <UploadAudio projectId={projectId} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Meetings</h2>
          <MeetingsList
            meetings={meetings}
            meetingsLoading={false}
            projectId={projectId} // Pass projectId
          />
        </div>
      </div>
    </main>
  )
}