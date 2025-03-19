'use client';

import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Import useRouter for client-side navigation
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../../../components/app-sidebar';
import { ModeToggle } from '../../../components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  return (
    <SidebarProvider>
      <div className="w-full flex h-screen overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="h-16 border-b bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container flex h-full items-center gap-4 px-10">
              <div className="flex-1 flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
                  Hey,
                </h1>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-1 transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-300">
                  {session?.user.name}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <ModeToggle />
                <Button
                  className="cursor-pointer w-20 rounded-lg text-blue-500 dark:text-blue-300 border-gray-300 dark:border-gray-600 transition-all duration-300 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white hover:shadow-md"
                  variant="outline"
                  onClick={() => router.push('/pricing')} // Navigate to pricing page
                >
                  Upgrade
                </Button>

                {loading ? (
                  <Avatar>
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 animate-pulse">
                      ...
                    </AvatarFallback>
                  </Avatar>
                ) : session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:shadow-md">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User avatar'} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                          {session.user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                      <DropdownMenuLabel className="text-gray-800 dark:text-gray-100">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
                            {session.user.name}
                          </p>
                          <p className="text-xs leading-none text-gray-600 dark:text-gray-400 transition-opacity duration-200 hover:opacity-80">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                      <DropdownMenuItem
                        onClick={() => router.push('/create')}
                        className="text-gray-800 dark:text-gray-100 bg-blue-500  hover:bg-blue-700 transition-all -300 hover:shadow-md cursor-pointer"
                      >
                        <span className="w-full text-left text-black dark:text-white">Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/billing')}
                        className="text-gray-800 dark:text-gray-100 bg-blue-500 hover:bg-blue-700 transition-all duration-300 hover:shadow-md cursor-pointer"
                      >
                        <span className="w-full text-left text-black dark:text-white">Billing</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 focus:text-red-700 dark:focus:text-red-300"
                      >
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;