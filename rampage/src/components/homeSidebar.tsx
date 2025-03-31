"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Presentation,
  Plus,
  ChevronLeft,
  ChevronRight,
  ProjectorIcon,
  File,
  Folder,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { GetAllProjects } from "@/lib/query"; // Corrected import name

const fetchProjects = async (): Promise<{ id: string; name: string }[]> => {
  const projects = await GetAllProjects();
  if (Array.isArray(projects)) {
    return projects
      .map((project: { id: string; name: string | null }) => ({
        id: project.id,
        name: project.name || "Unnamed Project",
      }))
      .slice(0, 5); // Limit to 5 projects
  }
  console.error("Expected an array but received:", projects);
  return [];
};

const items = [
  { title: "Create", url: "create", icon: Plus },
  { title: "Projects", url: "projects", icon: LayoutDashboard },
  { title: "Billing", url: "billing", icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const fetchedProjects = await fetchProjects();
      setProjects(fetchedProjects);
    };
    loadProjects();
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const projectId = segments[1];
  const currentPage = segments[2] || "";

  return (
    <Sidebar collapsible="icon" variant="floating" className="bg-white dark:bg-gray-900 shadow-md">
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
        {/* Application Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-500 dark:text-orange-400 font-medium">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url === "create" ? "/create" : `/${item.url}`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        pathname === `/${item.url}` || currentPage === item.url
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        pathname === `/${item.url}` || currentPage === item.url
                          ? "text-white"
                          : "text-orange-500 dark:text-orange-400"
                      )} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-500 dark:text-orange-400 font-medium">
            Recent Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/project/${project.id}/dashboard`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        projectId === project.id && currentPage === "dashboard"
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400"
                      )}
                    >
                      <Folder className={cn(
                        "w-5 h-5",
                        projectId === project.id && currentPage === "dashboard"
                          ? "text-white"
                          : "text-orange-500 dark:text-orange-400"
                      )} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Button
        className={cn(
          "w-full flex items-center gap-2 p-4 transition-all duration-300 border-t border-orange-200 dark:border-orange-900/50",
          open
            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white"
            : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
        )}
        variant="ghost"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
        )}
        {open && <span>Collapse</span>}
      </Button>
    </Sidebar>
  );
}