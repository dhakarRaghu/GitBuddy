import { log } from "console";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { z } from 'zod'
import { pollCommits } from "~/lib/github";
import { checkCredit, indexGithubRepo } from "~/lib/github-loader";
import { get } from "http";
import { issue } from "@uiw/react-md-editor";
import { Archive } from "lucide-react";
import { check } from "prettier";
// TRPC router help to communicate with the  frontend and backend
export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        // Validate user ID
        const user = await ctx.db.user.findUnique({
            where: { id: ctx.user.userId ?? undefined },
        });

        if (!user) {
            throw new Error("User not found");
        }
        console.log("User ID in context:", ctx.user.userId);

        const currentCredits = user.credits || 0;
        const fileCount = await checkCredit(input.githubUrl, input.githubToken ?? process.env.GITHUB_TOKEN);

        if(currentCredits < fileCount){
            throw new Error("Insufficient credits");
        }

        // Create project and associate with user
        const project = await ctx.db.project.create({
            data: {
                
                githubUrl: input.githubUrl,
                name: input.name,

               userToProjects: {
                    create: {
                        userId: ctx.user.userId!,
                    },
                },
            },
        });
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken ?? process.env.GITHUB_TOKEN);
        await pollCommits(project.id);
        await ctx.db.user.update({ where :{id : ctx.user.userId!}, data : {credits : {decrement : fileCount}}});
        return project;
    }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        
        const projects = await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!,
                    },
                },
                deletedAt: null,
            },
        });
        console.log("getProject Projects:", projects , "User ID:", ctx.user.userId);
        return projects;
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => 
        {
            pollCommits(input.projectId).then().catch(console.error);
        return ctx.db.commit.findMany({ where: { projectId: input.projectId } });
    }),

    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data : {
            projectId: input.projectId,
            question: input.question,
            answer: input.answer,
            filesReferences: input.filesReferences,
            userId: ctx.user.userId!
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({projectId : z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.question.findMany({
            where :{
                projectId : input.projectId
             },
             include : {
                    user : true
                },
            orderBy : {
                createdAt : 'desc'
            }
        });
    }),
    uploadMeeting: protectedProcedure.input(z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string()
    })).mutation(async ({ ctx, input }) => {
        const meeting = await ctx.db.meeting.create({
            data: {
                meetingUrl: input.meetingUrl,
                projectId: input.projectId,
                name: input.name,
                status: "PROCESSING"
            }
        });
        return meeting;
    }),
    getMeetings : protectedProcedure.input(z.object({projectId : z.string()})).query(async ({ctx, input}) => {
        console.log("Fetching meetings for project:", input.projectId);
        return await ctx.db.meeting.findMany({ where : {projectId : input.projectId }, include : {issue : true}})
    }),
    deleteMeeting: protectedProcedure.input(z.object({meetingId : z.string()})).mutation(async ({ctx, input}) => {
        return await ctx.db.meeting.delete({where : {id : input.meetingId}});
    }),
    getMeetingById : protectedProcedure.input(z.object({meetingId : z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.meeting.findUnique({where : {id : input.meetingId} , include : {issue : true}});
    }),
    archiveProject : protectedProcedure.input(z.object({projectId : z.string()})).mutation(async ({ctx, input}) => {
        return await ctx.db.project.update({where : {id : input.projectId}, data : {deletedAt : new Date()}});
    }),
    getTeamMembers : protectedProcedure.input(z.object({projectId : z.string()})).query(async ({ctx, input}) => {
        return await ctx.db.userToProject.findMany({where : {projectId : input.projectId}, include : {user : true}});
    }),
    getMyCredits : protectedProcedure.query(async ({ctx}) => {
        if (!ctx.user.userId) {
            throw new Error("User ID is null");
        }
        return await ctx.db.user.findUnique({where : {id : ctx.user.userId} , select : {credits : true}});
    }),

    checkCredit: protectedProcedure.input(z.object({githubUrl : z.string(), githubToken : z.string().optional()})).mutation(async ({ctx, input}) => {
        const fileCount =  await checkCredit(input.githubUrl, input.githubToken);
        const userCredits = await ctx.db.user.findUnique({where : {id : ctx.user.userId!}, select : {credits : true}});
        return {fileCount, userCredits : userCredits?.credits || 0};
    }),

})