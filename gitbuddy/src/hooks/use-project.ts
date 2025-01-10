import React from 'react'
import { api } from '~/trpc/react'
import { useLocalStorage } from 'usehooks-ts'


//if we refresh the tab then the value of project get persisted
const useProject = () => {
    const {data : projects} = api.project.getProjects.useQuery()
    const [projectId , setProjectId] = useLocalStorage('GitBuddy-projectId' ,"")
    const project = projects?.find( project => project.id === projectId)
  return {
    projects,
    project,
    projectId,
    setProjectId
  }
}

export default useProject
