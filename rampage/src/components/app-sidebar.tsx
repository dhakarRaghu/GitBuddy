"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bot, CreditCard, LayoutDashboard, Presentation, Plus, PlusCircle } from 'lucide-react';
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// import useProject from "@/hooks/use-project";  
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
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  // const { projects, projectId, setProjectId } 

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src="/logo4.png" alt="logo" width={80} height={80} />
          {open && (
            <h1 className="text-2xl font-extrabold text-primary/90 tracking-wide leading-tight drop-shadow-md">
              <Link href="/">GitBuddy</Link>
            </h1>
          )}
        </div>
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
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ease-in-out",
                        pathname === item.url
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-100"
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

        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Link href={"/create"} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <PlusCircle size={16} />
          <span>Create new project</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}