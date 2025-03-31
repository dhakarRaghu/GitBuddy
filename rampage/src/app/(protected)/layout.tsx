"use client";

import React, { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
import { AppSidebar } from '@/components/homeSidebar';
import { ModeToggle } from '@/components/mode-toggle';

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  return (
    <SidebarProvider>
      <div className="w-full flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="h-16 border-b bg-white/95 dark:bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container flex h-full items-center gap-4 px-10 max-w-7xl">
              <div className="flex-1 flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  Hey,
                </h1>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 transition-all duration-300 hover:text-orange-500 dark:hover:text-orange-400">
                  {session?.user.name}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <ModeToggle />
                <Button
                  className="w-20 rounded-lg text-orange-500 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all duration-300 hover:shadow-md"
                  variant="outline"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade
                </Button>

                {loading ? (
                  <Avatar>
                    <AvatarFallback className="bg-orange-200 dark:bg-orange-900/50 animate-pulse">
                      ...
                    </AvatarFallback>
                  </Avatar>
                ) : session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:shadow-md ring-2 ring-orange-200 dark:ring-orange-900 hover:ring-orange-500 dark:hover:ring-orange-400">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User avatar'} />
                        <AvatarFallback className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                          {session.user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900/50 shadow-lg"
                    >
                      <DropdownMenuLabel className="text-orange-500 dark:text-orange-400">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none transition-colors duration-200 hover:text-orange-600 dark:hover:text-orange-300">
                            {session.user.name}
                          </p>
                          <p className="text-xs leading-none text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-orange-200 dark:bg-orange-900/50" />
                      <DropdownMenuItem
                        onClick={() => router.push('/create')}
                        className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200"
                      >
                        <span className="w-full text-left">Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/billing')}
                        className="text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-200"
                      >
                        <span className="w-full text-left">Billing</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-orange-200 dark:bg-orange-900/50" />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-red-600 dark:text-red-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;