// "use client"
import RepoInsights from './analytics';
// import { usePathname } from 'next/navigation';
import React from 'react'
interface Props {
  params: Promise<{ projectId: string }>;
}

const Analytics =async ({ params }: Props) => {
  const { projectId } = await params;
  // const projectId = slug[0];
    // const path = usePathname();
    //  console.log("QA page for project:", path);
    //  const parts = path.split("/");
    //  const projectId = parts[2];
    //  console.log("projectId", projectId);
    console.log("projectId", projectId);
  return (
    <div>
        <RepoInsights projectId={projectId}></RepoInsights>
    </div>
  )
}

export default Analytics