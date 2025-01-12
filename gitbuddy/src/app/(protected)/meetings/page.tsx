// "use client"
// import React from 'react';
// import useProject from '~/hooks/use-project';
// import MeetingCard from '../dashboard/meeting-card';
// import { api } from '~/trpc/react';
// import Link from 'next/link';
// import { Badge } from 'lucide-react';

// const MeetingsPage = () => {
// 	const {projectId} = useProject();
	
// 	  const { data: meetings , isLoading  } = api.project.getMeetings.useQuery({projectId},{
// 		refetchInterval: 4000
// 	  })

//   return (
// 	<>
// 	  <MeetingCard />
// 	  <div className="h-6"></div>
// 	  <h1 className="text-xl font-semibold">Meetings</h1>
// 	  {meetings && meetings.length === 0 &&  <div>No meeting found</div>}
// 	  {isLoading && <div>Loading...</div>}
// 	  <ul className='divide-y divide-gray-200'>
// 		{meetings?.map(meeting => (
// 			<li key = {meeting.id} className='flex items-center justify-between py-5 gap-x-6'>
// 				<div>
// 					<div className='min-w-0'>
// 						<div className='flex items-center gap-2'>
// 							<Link href={`/meeting/${meeting.id}`} className='text-sm font-semibold'> 
// 								{meeting.name}
// 							</Link>
// 							{meeting.status === 'PROCESSING' &&(
// 								<Badge className='bg-yellow-500 text-white'>
// 									Processing...
// 								</Badge>
// 							)}

// 						</div>
// 					</div>
// 					<div className='flex items-center text-xs text-gray-500 gap-x-2'>
// 						<p className='whitespace-nowrap'>
// 							{meeting.createdAt.toLocaleDateString()}
// 						</p>
// 						<p className='truncate'>{meeting.issue.length} issues </p>

// 					</div>
// 				</div>
// 				<div className='flex items-none gap-x-4'>
// 					<Link href={`/meeting/${meeting.id}`} className='text-primary'>
// 						View Meeting
// 					</Link>
// 				</div>
// 			</li>	
		
// 			))}
// 	  </ul>
// 	</>
//   );
// };

// export default MeetingsPage;

'use client'

import React from 'react'
import useProject from '~/hooks/use-project'
import MeetingCard from '../dashboard/meeting-card'
import { api } from '~/trpc/react'
import Link from 'next/link'
import { Badge } from '~/components/ui/badge'
import { Loader2 } from 'lucide-react'

const MeetingsPage = () => {
    const { projectId } = useProject()
    
    const { data: meetings, isLoading: meetingsLoading } = api.project.getMeetings.useQuery(
        { projectId: projectId || '' },
        {
            enabled: !!projectId,
            refetchInterval: 4000
        }
    )


    if (!projectId) {
        return <div>No project selected. Please select a project first.</div>
    }

    return (
        <>
                <div className="grid gap-4">
                <div>
                    <h1 className="text-xl font-semibold mb-2">Create Meeting</h1>
                    <MeetingCard />
                </div>
				</div>
            <div className="h-16"></div>
            <h1 className="text-xl font-semibold">Meetings</h1>
            {meetingsLoading && <div className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading meetings...</div>}
            {meetings && meetings.length === 0 && <div>No meetings found</div>}
            <ul className='divide-y divide-gray-200'>
                {meetings?.map(meeting => (
                    <li key={meeting.id} className='flex items-center justify-between py-5 gap-x-6'>
                        <div>
                            <div className='min-w-0'>
                                <div className='flex items-center gap-2'>
                                    <Link href={`/meeting/${meeting.id}`} className='text-sm font-semibold'> 
                                        {meeting.name}
                                    </Link>
                                    {meeting.status === 'PROCESSING' && (
                                        <Badge className='bg-yellow-500 text-white'>Processing...</Badge>
                                    )}
                                </div>
                            </div>
                            <div className='flex items-center text-xs text-gray-500 gap-x-2'>
                                <p className='whitespace-nowrap'>
                                    {new Date(meeting.createdAt).toLocaleDateString()}
                                </p>
                                <p className='truncate'>{meeting.issue.length} issues</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-x-4'>
                            <Link href={`/meeting/${meeting.id}`} className='text-primary'>
                                View Meeting
                            </Link>
                        </div>
                    </li>    
                ))}
            </ul>
        </>
    )
}

export default MeetingsPage

