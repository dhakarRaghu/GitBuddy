import React from 'react'
// import IssuesList from './issuses-list'
import { Metadata } from 'next'

type Props = {
  params: { meetingId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Meeting Details - ${params.meetingId}`,
    description: 'View details and issues for this meeting',
  }
}

export default function MeetingDetailsPage({ params }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Meeting Details</h1>
      {/* <IssuesList meetingId={params.meetingId} /> */}
    </div>
  )
}

