"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Bot, CreditCard, LayoutDashboard, Presentation , Plus } from "lucide-react";
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
} from "~/components/ui/sidebar";

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

const projects = [
  {
    name: "Project 1",
  },
  {
    name: "Project 2",
  },
  {
    name: "Project 3",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const {open} = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Image src="/logo5.png" alt = 'logo' width={80} height={80}/>
            {open && (
                 <h1 className="text-2xl font-extrabold text-primary/90 tracking-wide leading-tight drop-shadow-md">
                 GitBuddy
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
                        {
                          "!bg-primary !text-white": pathname === item.url,
                        },
                        "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
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

          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100",
                        {
                          "bg-primary text-white": pathname === `/projects/${project.name}`, // Example dynamic route
                        }
                      )}
                    >
                      {/* Project Icon */}
                      <div className="rounded-sm bg-primary text-white w-6 h-6 flex items-center justify-center">
                        {project.name[0]}
                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>

              <SidebarMenuItem>
                {open && (
                <Link href= '/create'>
                <Button variant="outline" className="w-fit flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create new project
                </Button>
                </Link>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// "use client";

// import { cn } from "~/lib/utils";
// import { Bot, CreditCard, LayoutDashboard, Presentation } from "lucide-react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import {
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarGroupContent,
//   SidebarMenuItem,
//   SidebarMenu,
//   SidebarMenuButton,
// } from "~/components/ui/sidebar";

// const items = [
//   {
//     title: "Dashboard",
//     url: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     title: "Q&A",
//     url: "/qa",
//     icon: Bot,
//   },
//   {
//     title: "Meetings",
//     url: "/meetings",
//     icon: Presentation,
//   },
//   {
//     title: "Billing",
//     url: "/billing", 
//     icon: CreditCard,
//   },
// ];

// const projects = [
//    {
//     name: "Project 1",
//   },
//   {
//     name: "Project 2",
//   },
//   {
//     name: "Project 3",
//   },

// ]

// export function AppSidebar() {
//   const pathname = usePathname();

//   return (
//     <Sidebar collapsible="icon" variant="floating">
//       <SidebarHeader>Logo</SidebarHeader>

//       <SidebarContent>
//             <SidebarGroup>
//             <SidebarGroupLabel>Application</SidebarGroupLabel>

//             <SidebarGroupContent>
//                 <SidebarMenu>
//                 {items.map((item) => (
//                     <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild>
//                         <Link
//                         href={item.url}
//                         className={cn(
//                             {
//                             "!bg-primary !text-white": pathname === item.url,
//                             },
//                             "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
//                         )}
//                         >
//                         <item.icon className="w-5 h-5" />
//                         <span>{item.title}</span>
//                         </Link>
//                     </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 ))}
//                 </SidebarMenu>
//             </SidebarGroupContent>
//             </SidebarGroup>

//         <SidebarGroup>
//             <SidebarGroupLabel> Your Project</SidebarGroupLabel>
//                 <SidebarGroupContent>
//                     <SidebarMenu>
//                         {projects.map(project => {
//                             return (
//                                 <SidebarMenuItem key={project.name}>
//                                 <SidebarMenuButton asChild>
//                                     <div className={
//                                         cn(
//                                         'rounded-sm border size-6 flex items-center text-primary',
//                                         {
//                                             'bg-primary text-white' : true
//                                             // 'bg-primary text-white': pathname === item.url,
//                                         }
//                                         ) }>
//                                             {project.name[0]}
//                                     </div>
//                                     <span>{project.name}</span>
//                                 <SidebarMenuButton />
//                                 <SidebarMenuItem/>

//                             )
//                         })}
                
//                     </SidebarMenu>
//                 </SidebarGroupContent>
//         </SidebarGroup>

//       </SidebarContent>
//     </Sidebar>
//   );
// }
