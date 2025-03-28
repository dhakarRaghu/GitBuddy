"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot, CreditCard, LayoutDashboard, Presentation, Plus, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

const items = [
    {
      title: "Create",
      url: "create",
      icon: Plus,
    },
  {
    title: "Projects",
    url: "projects", // Simplified to just the segment, no leading slash
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
  const { open , setOpen } = useSidebar();
  const toggle = () => {
    // Implement the toggle logic here, e.g., toggling a state or calling a method
    console.log("Toggle sidebar functionality not implemented yet.");
  };

  // Extract projectId from the pathname (e.g., /project/cm8h8yd3i000975zdq4tefhsq/dashboard)
  const segments = pathname.split("/").filter(Boolean); // Split and remove empty segments
  const projectId = segments[1]; // Assuming the structure is /project/{projectId}/{page}
  console.log("projectId", projectId);

  // Determine the current page for highlighting (e.g., "dashboard", "qa")
  const currentPage = segments[2] || ""; // The third segment is the page (e.g., "dashboard")

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="relative">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={80} height={80} />
          {open && (
            <h1 className="text-2xl font-extrabold text-primary/90 tracking-wide leading-tight drop-shadow-md">
              <Link href="/create">GitBuddy</Link>
            </h1>
          )}
        </div>
        {/* Toggle Button for Minimizing/Maximizing Sidebar */}
      </SidebarHeader>

      <SidebarContent>
        {/* Application Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/project/${projectId}/${item.url}`} // Corrected URL structure
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        currentPage === item.url
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          {/* Add project list here if needed */}
        </SidebarGroup>
      </SidebarContent>
      <Button
        className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:shadow-md"
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform duration-200", open ? "" : "rotate-180")}
        />
      </Button>
    </Sidebar>
  );
}