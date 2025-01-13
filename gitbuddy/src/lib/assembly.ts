import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

function msToTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export async function processMeeting(meetingUrl: string) {
  try {
    console.log("Starting transcription for:", meetingUrl);

    const transcript = await client.transcripts.transcribe({
      audio: meetingUrl,
      auto_chapters: true,
    })

    console.log("Transcription completed. Transcript length:", transcript.text?.length);

    if (!transcript.text) {
      throw new Error('No transcript found');
    }

    const summaries = transcript.chapters?.map(chapter => ({
      start: msToTime(chapter.start),
      end: msToTime(chapter.end),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary
    })) || [];

    console.log("Summaries generated:", summaries.length);

    return {
      transcript: transcript.text,
      summaries
    }
  } catch (error) {
    console.error('Error in processMeeting:', error);
    throw error;
  }
}

