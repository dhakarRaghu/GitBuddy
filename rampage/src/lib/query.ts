"use server";

import { prisma } from "./db";
import { getAuthSession } from "./auth";
import { checkCreditsAndStructure } from "./githubLoader";
// import { initializeProjectEmbeddings } from "@/app/project/[projectId]/qa/actions";
import { redirect } from "next/navigation";


export async function CreateProject(githubUrl: string, name: string) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if(!session) redirect("/login");

  if (!userId) throw new Error("Unauthorized");

  try {
    if (!name) throw new Error("Project name is required");

    // Check credits
    const { fileCount, userCredits } = await checkCreditsAndStructure(githubUrl);
    if (fileCount > userCredits) throw new Error("Insufficient credits");

    // Create project without file structure
    const project = await prisma.project.create({
      data: {
        name,
        githubUrl,
      },
    });
    await prisma.userToProject.create({
      data: {
        userId,
        projectId: project.id,
      },
    });

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: fileCount } },
    });

    return { project, message: "Project created successfully" };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error(`Failed to create project: ${(error as Error).message}`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GetProjects() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  try {
    const projects = await prisma.project.findMany({
      where: { 
        users: { some: { id: userId } },
       },
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error(`Failed to fetch projects: ${(error as Error).message}`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCommit(projectId:string) {
  // const session = await getAuthSession();
  // const userId = session?.user?.id;

  // if (!userId) throw new Error("Unauthorized");

  try {
    const commits = await prisma.commit.findMany({
      where: { projectId: projectId },
      orderBy: { commitDate: "desc" },
    });

    return commits;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw new Error(`Failed to fetch commits: ${(error as Error).message}`);
  } finally {
    await prisma.$disconnect();
  }
  
}