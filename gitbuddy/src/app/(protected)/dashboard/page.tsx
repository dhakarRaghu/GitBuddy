"use client"
import { useUser } from '@clerk/nextjs'
import React from 'react'
import useProject from '~/hooks/use-project'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'

const DashBoardPage = () => {
    const { user } = useUser()
    const { project } = useProject()

    return (
        <div>
            <div className='flex items-center justify-between flex-wrap gap-y-4'>
                <div className='w-fit rounded-md bg-primary px-4 py-3'>
                    <div className="flex items-center">
                        <Github className='size-5 text-white' />
                        <div className="ml-2">
                            <span className="text-sm font-medium text-white">
                                This project is linked to {' '}
                                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-white/80 hover:underline'>
                                    {project?.githubUrl}
                                    <ExternalLink className='ml-1 size-4' />
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>

                <div className='h-4'></div>

                <div className='flex items-center gap-4'>
                    team members
                    Invite
                    archive
                </div>
            </div>

            <div className='h-4'></div>

            {/* Updated grid layout */}
            <div className='grid grid-cols-5 gap-4'>
                <div className='col-span-3'>
                    <AskQuestionCard />
                </div>
                <div className='col-span-2'>
                    {/* Replace this placeholder with your actual component for the meeting card */}
                    <div className="border p-4 rounded-md h-full">Meeting Card Placeholder</div>
                </div>
            </div>

            <div className='mt-8'>
                <CommitLog />
            </div>
        </div>
    )
}

export default DashBoardPage
