
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { db } from '~/server/db';

type Props = {
  params: { projectId: string };
};

const JoinHandler = async (props: Props) => {
  const { projectId } = props.params;
  const {userId } =  await auth();
  if(!userId) return redirect("/sign-in")
  const dbUser = await db.user.findUnique({
	where: {
	  id: userId,
	},
  });

  const clien= await clerkClient();
  const user = await clien.users.getUser(userId);
  if(!dbUser){
    await db.user.create({
      data: {   
        id: userId,
        emailAddresses: user.emailAddresses[0]!.emailAddress,
        imageUrls:user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,       
    }
    });
    }

const project = await db.project.findUnique({
    where: {
        id: projectId,
    },
});

if (!project) return redirect("/dashboard");

try {
    await db.userToProject.create({
        data: {
            userId,
            projectId,
        },
    });
} catch (error) {
    console.log('user already in project');
    // toast('You are already in this project');
    return redirect(`/dashboard`);
}

};

export default JoinHandler;