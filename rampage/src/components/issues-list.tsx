'use client'

import React, { useState } from 'react'
import { VideoIcon, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type Issue = {
  id: string
  createdAt: Date
  start: string
  end: string
  gist: string
  headline: string
  summary: string
  audioUrl?: string
}

type Meeting = {
  id: string
  name: string
  createdAt: Date
  meetingUrl: string
  status: "PROCESSING" | "COMPLETED"
  issues?: Issue[]
}

type Props = {
  meeting: Meeting
}

export default function IssuesList({ meeting }: Props) {
  if (!meeting) {
    return <div className="text-center p-4">Meeting data not available</div>
  }

  return (
    <div className="space-y-8">
      <MeetingHeader meeting={meeting} />
      <IssuesGrid issues={meeting.issues ?? []} />
    </div>
  )
}

function MeetingHeader({ meeting }: { meeting: Meeting }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b pb-6">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary p-3">
          <VideoIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Meeting on {new Date(meeting.createdAt).toLocaleDateString()}
          </h2>
          <h1 className="text-2xl font-bold text-foreground">
            {meeting.name}
          </h1>

          <Badge
            variant={meeting.status === "PROCESSING" ? "outline" : "default"}
            className={meeting.status === "PROCESSING" 
              ? "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-900/50" 
              : "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-900/50"}
          >
            {meeting.status === "PROCESSING" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Processing
              </>
            ) : "Completed"}
          </Badge>
        </div>
      </div>
      
      <div className="w-full md:w-80 mt-4 md:mt-0 md:ml-auto space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Uploaded Audio</p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
          <audio controls className="w-full" src={meeting.meetingUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  )
}

function IssuesGrid({ issues }: { issues: Issue[] }) {
  if (!issues || issues.length === 0) {
    return <p className="text-gray-500 text-center mt-4">No issues found.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>
              {issue.createdAt instanceof Date 
                ? issue.createdAt.toLocaleDateString() 
                : new Date(issue.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h4 className="font-semibold">{issue.headline}</h4>
            <blockquote className="mt-2 border-l-4 border-primary bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {issue.start} - {issue.end}
              </p>
              <p className="mt-1 italic text-foreground">
                {issue.summary}
              </p>
            </blockquote>

            {issue.audioUrl && (
              <div className="mt-4">
                <h4 className="font-medium text-foreground">Listen to Issue Summary:</h4>
                <audio controls className="w-full mt-2">
                  <source src={issue.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Card className="transition-shadow hover:shadow-lg rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg font-semibold">{issue.gist}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => setIsOpen(true)}>
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>

          {issue.audioUrl && (
            <audio controls className="w-full mt-2">
              <source src={issue.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
        </CardContent>
      </Card>
    </>
  )
}