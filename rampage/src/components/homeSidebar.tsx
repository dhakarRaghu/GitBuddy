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
import { GetAllProject } from "@/lib/query";

// Mock function to fetch projects (replace with actual API call)
const fetchProjects = async (): Promise<{ id: string; name: string }[]> => {
  const projects = await GetAllProject();
  if (Array.isArray(projects)) {
    return projects.map((project: { id: string; name: string | null }) => ({
      id: project.id,
      name: project.name || "Unnamed Project",
    })).slice(0, 5); // Limit to 5 projects
  }
  console.error("Expected an array but received:", projects);
  return [];
};

const items = [
  {
    title: "Create",
    url: "create",
    icon: Plus,
  },
  {
    title: "Projects",
    url: "projects",
    icon: LayoutDashboard,
  },
  {
    title: "Meetings",
    url: "meetings",
    icon: Presentation,
  },
  {
    title: "Analytics",
    url: "analytics",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "billing",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  // Fetch projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      const fetchedProjects = await fetchProjects();
      setProjects(fetchedProjects);
    };
    loadProjects();
  }, []);

  // Extract projectId from the pathname (e.g., /project/cm8h8yd3i000975zdq4tefhsq/dashboard)
  const segments = pathname.split("/").filter(Boolean); // Split and remove empty segments
  const projectId = segments[1]; // Assuming the structure is /project/{projectId}/{page}

  // Determine the current page for highlighting (e.g., "dashboard", "qa")
  const currentPage = segments[2] || ""; // The third segment is the page (e.g., "dashboard")

  return (
    <Sidebar collapsible="icon" variant="floating" className="bg-white dark:bg-gray-900">
      <SidebarHeader className="relative">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={80} height={80} />
          {open && (
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide leading-tight drop-shadow-md">
              <Link href="/create">GitBuddy</Link>
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Application Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400">
            Application
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={
                        item.url === "create"
                          ? "/create"
                          : `/project/${projectId}/${item.url}`
                      }
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        currentPage === item.url
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
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
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400">
            Recent Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/project/${project.id}/qa`}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        projectId === project.id && currentPage === "qa"
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <Folder className="w-5 h-5" />
                      <span>{project.name}</span>
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
          "w-full flex items-center gap-2 transition-all duration-300",
          open
            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:shadow-md"
            : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
        )}
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
        )}
      </Button>
    </Sidebar>
  );
}