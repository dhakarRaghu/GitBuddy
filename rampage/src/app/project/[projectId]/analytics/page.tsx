
import RepoInsights from './analytics';
import React from 'react'
interface Props {
  params: Promise<{ projectId: string }>;
}

const Analytics =async ({ params }: Props) => {
  const { projectId } = await params;
    console.log("projectId", projectId);
    
  return (
    <div>
        <RepoInsights projectId={projectId}></RepoInsights>
    </div>
  )
}

export default Analytics