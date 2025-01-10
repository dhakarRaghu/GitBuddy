import { log } from "console";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import { z } from 'zod'
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
        // console.log("User ID in context:", ctx.user.userId);
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

        return project;
    }),
});
