"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, FileText, Clock, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteMeeting } from "@/lib/uploadToVercel";

// Define the Issue type
interface Issue {
  id: string;
  start: string;
  end: string;
  gist: string;
  headline: string;
  summary: string;
}

// Update the Meeting type to use 'issues' instead of 'issue'
interface Meeting {
  id: string;
  name: string;
  createdAt: string;
  meetingUrl: string;
  status: "PROCESSING" | "COMPLETED";
  issues: Issue[]; // Corrected from 'issue' to 'issues'
}

interface MeetingsListProps {
  meetings: Meeting[];
  meetingsLoading: boolean;
  projectId: string;
}

export default function MeetingsList({ meetings, meetingsLoading, projectId }: MeetingsListProps) {
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = (meetingId: string) => {
    startTransition(async () => {
      try {
        await deleteMeeting(meetingId);
        toast.success("Meeting deleted successfully");
        router.refresh(); // Refresh the page to refetch meetings
      } catch (error) {
        toast.error("Failed to delete meeting");
        console.error("Error deleting meeting:", error);
      }
    });
  };

  return (
    <Card className="w-full border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meetingsLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border border-border/50">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        )}

        {!meetingsLoading && meetings?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No meetings found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first meeting to get started</p>
            <Button>Create Meeting</Button>
          </div>
        )}

        {!meetingsLoading && meetings && meetings.length > 0 && (
          <div className="space-y-3 mt-2">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="group rounded-lg border border-border/50 hover:border-border transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{meeting.name}</h3>
                      {meeting.status === "PROCESSING" ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-900/50"
                        >
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Processing
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-900/50"
                        >
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-x-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(meeting.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/project/${projectId}/meetings/${meeting.id}`}>
                      <Button variant="outline" size="sm" className="h-9">
                        <span className="hidden sm:inline mr-1">View</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={isPending}
                          onClick={() => handleDelete(meeting.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Meeting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}