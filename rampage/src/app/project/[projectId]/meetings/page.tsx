
import MeetingsList from '@/components/meetings-list';
import UploadAudio from '@/components/upload-audio';
import { allMeetings } from '@/lib/uploadToVercel';
import React from 'react'
interface Props {
  params: Promise<{ projectId: string }>;
}

const Analytics =async ({ params }: Props) => {
  const { projectId } = await params;
  console.log("projectId", projectId);
  const projects = await allMeetings(projectId);
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
              meetings={projects}
              meetingsLoading={false}
  
            />
          </div>
        </div>
      </main>
  )
}

export default Analytics

