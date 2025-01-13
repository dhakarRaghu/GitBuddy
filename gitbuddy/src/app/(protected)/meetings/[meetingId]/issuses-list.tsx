'use client'

import { api, RouterOutputs } from '~/trpc/react'
import React, { useState } from 'react'
import { VideoIcon, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Skeleton } from '~/components/ui/skeleton'

type Props = {
  meetingId: string
}

export default function IssuesList({ meetingId }: Props) {
  const { data: meeting, isLoading, error } = api.project.getMeetingById.useQuery({ meetingId }, {
    refetchInterval: 4000,
  })

  if (isLoading) {
    return <IssuesListSkeleton />
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  if (!meeting) {
    return <ErrorMessage message="Meeting not found" />
  }

  return (
    <div className="space-y-8">
      <MeetingHeader meeting={meeting} />
      <IssuesGrid issues={meeting.issue} />
    </div>
  )
}

function MeetingHeader({ meeting }: { meeting: NonNullable<RouterOutputs['project']['getMeetingById']> }) {
  return (
    <div className="flex items-center gap-4 border-b pb-6">
      <div className="rounded-full bg-primary p-3">
        <VideoIcon className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          Meeting on {meeting.createdAt.toLocaleDateString()}
        </h2>
        <h1 className="text-2xl font-bold text-foreground">
          {meeting.name}
        </h1>
      </div>
    </div>
  )
}

function IssuesGrid({ issues }: { issues: NonNullable<RouterOutputs['project']['getMeetingById']>['issue'] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}

function IssueCard({ issue }: { issue: NonNullable<RouterOutputs['project']['getMeetingById']>['issue'][number] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>
              {issue.createdAt.toLocaleDateString()}
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
          </div>
        </DialogContent>
      </Dialog>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-1">{issue.gist}</CardTitle>
          <CardDescription className="line-clamp-2">{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

function IssuesListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-6 w-64" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="space-y-4">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-semibold text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Please try again later or contact support if the problem persists.</p>
    </div>
  )
}

