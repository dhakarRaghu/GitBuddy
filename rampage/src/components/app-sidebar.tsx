"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot, CreditCard, LayoutDashboard, Presentation, Plus, PlusCircle, ChevronLeft, ChevronRight, ProjectorIcon } from 'lucide-react';
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

const items = [
  {
    title: "Commits",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ask me",
    url: "qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "meetings",
    icon: Presentation,
  },
  {
    title: "Analytics",
    url: "analytics",
    icon: ProjectorIcon,
  },
  {
    title: "PR and Issues",
    url: "prAndissue",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const [isOpen, setIsOpen] = useState(open);
  
  // Sync the internal state with the sidebar state
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const toggleSidebar = () => {
    setOpen(!open);
    setIsOpen(!isOpen);
  };

  // Extract projectId from the pathname
  const segments = pathname.split("/").filter(Boolean);
  const projectId = segments[1];

  // Determine the current page for highlighting
  const currentPage = segments[2] || "";

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="relative p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={80} height={80} />
          {open && (
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 tracking-wide leading-tight drop-shadow-md">
              <Link href="/create">GitBuddy</Link>
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-500 font-medium">Application</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/project/${projectId}/${item.url}`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        currentPage === item.url
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                          : "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        currentPage === item.url
                          ? "text-white"
                          : "text-orange-500"
                      )} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            
            {open && (
              <div className="mt-4 px-2">
                <Link href="/create">
                  <Button variant="outline" className="w-full flex items-center gap-2 transition-colors duration-200 border-orange-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent">
                    <Plus className="w-5 h-5" />
                    <span className="text-orange-500 hover:text-white">Create new project</span>
                  </Button>
                </Link>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          className={cn(
            "w-full flex items-center gap-2 transition-all duration-300",
            open
              ? "bg-gray-100 dark:bg-gray-800 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white"
              : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
          )}
          variant="outline"
          onClick={toggleSidebar}
        >
          {open ? (
            <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )}
          {open && <span>Collapse</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}