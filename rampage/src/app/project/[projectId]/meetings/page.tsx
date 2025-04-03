"use server";

import MeetingsList from "@/components/meetings-list";
import UploadAudio from "@/components/upload-audio";
import { fetchMeetings } from "@/lib/uploadToVercel";

// Define the Issue interface
interface Issue {
  id: string;
  start: string;
  end: string;
  gist: string;
  headline: string;
  summary: string;
}

// Define the Meeting interface
interface Meeting {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  meetingUrl: string;
  status: "PROCESSING" | "COMPLETED";
  issues: Issue[];
  // Add other properties returned by fetchMeetings if any
}

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function Home({ params }: Props) {
  const { projectId } = await params;
  const rawMeetings = await fetchMeetings(projectId);
  const meetings = rawMeetings.map((meeting: Meeting) => ({
    ...meeting,
    issues: meeting.issues.map((issue: Issue) => ({
      id: issue.id,
      start: issue.start,
      end: issue.end,
      gist: issue.gist,
      headline: issue.headline,
      summary: issue.summary,
    })),
    createdAt: meeting.createdAt.toISOString(),
    updatedAt: meeting.updatedAt.toISOString(),
  }));

  return (
    <main className="container mx-auto py-12 px-6 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 tracking-tight">
          Project Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Manage your project meetings and audio uploads seamlessly.
        </p>
      </div>
      <div className="gap-8 ">
        {/* Upload Audio Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-orange-200 dark:border-orange-900/50 p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mb-6">
            Upload Audio
          </h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50">
            <UploadAudio projectId={projectId} />
          </div>
        </section>

        {/* Meetings List Section */}
      </div>
      <div className="mt-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-orange-200 dark:border-orange-900/50 p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mb-6">
            Your Meetings
          </h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50">
            <MeetingsList
              meetings={meetings}
              meetingsLoading={false}
              projectId={projectId}
            />
          </div>
        </section>
      </div>
    </main>
  );
}