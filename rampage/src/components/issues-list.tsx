"use client";

import React, { useState, useEffect } from 'react';
import { VideoIcon, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MeetingStatus } from '@/lib/query';

type Issue = {
  id: string;
  createdAt: Date;
  start: string;
  end: string;
  gist: string;
  headline: string;
  summary: string;
  audioUrl?: string;
};

type Meeting = {
  id: string;
  name: string;
  createdAt: Date;
  meetingUrl: string;
  status: "PROCESSING" | "COMPLETED";
  issues?: Issue[];
};

type Props = {
  meeting: Meeting;
};

export default function IssuesList({ meeting }: Props) {
  const [meetingStatus, setMeetingStatus] = useState(meeting.status);

  // Polling for status updates if the meeting is in PROCESSING state
  useEffect(() => {
    if (meetingStatus !== "PROCESSING") return;

    const interval = setInterval(async () => {
      try {
        const response = await MeetingStatus(meeting.id);
        const data =  response
       
          if (data.status === "COMPLETED") {
            // Refresh the page to get updated issues
            window.location.reload();
          }
        
      } catch (error) {
        console.error("Error polling meeting status:", error);
      }
    }, 1000); 

    return () => clearInterval(interval);
  }, [meetingStatus, meeting.id]);

  if (!meeting) {
    return <div className="text-center p-4 text-gray-500 dark:text-gray-400">Meeting data not available</div>;
  }

  return (
    <div className="space-y-8">
      <MeetingHeader meeting={{ ...meeting, status: meetingStatus }} />
      <IssuesGrid issues={meeting.issues ?? []} />
    </div>
  );
}

function MeetingHeader({ meeting }: { meeting: Meeting }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-orange-200 dark:border-orange-900/50 pb-6">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 p-3">
          <VideoIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Meeting on {new Date(meeting.createdAt).toLocaleDateString()}
          </h2>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Uploaded Audio</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-900/50">
          <audio controls className="w-full">
            <source src={meeting.meetingUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
}

function IssuesGrid({ issues }: { issues: Issue[] }) {
  if (!issues || issues.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center mt-4">No issues found.</p>;
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-900/50">
          <DialogHeader>
            <DialogTitle className="text-orange-500 dark:text-orange-400">{issue.gist}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {issue.createdAt instanceof Date 
                ? issue.createdAt.toLocaleDateString() 
                : new Date(issue.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{issue.headline}</h4>
            <blockquote className="mt-2 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {issue.start} - {issue.end}
              </p>
              <p className="mt-1 italic text-gray-900 dark:text-gray-100">
                {issue.summary}
              </p>
            </blockquote>

            {issue.audioUrl && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Listen to Issue Summary:</h4>
                <audio controls className="w-full mt-2">
                  <source src={issue.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Card className="transition-all duration-200 hover:shadow-lg hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 border-orange-200 dark:border-orange-900/50">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg font-semibold text-orange-500 dark:text-orange-400">{issue.gist}</CardTitle>
          <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{issue.headline}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center border-orange-300 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-colors duration-200"
            onClick={() => setIsOpen(true)}
          >
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
  );
}