import { BellDotIcon, Home, LogOut, MessageCircle, Settings, StickyNote } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"

const items = [
  {
    title: "Home",
    url: "/user",
    icon: Home,
  },
  // {
  //   title: " My Posts",
  //   url: "/user/posts",
  //   icon: StickyNote,
  // },
  {
    title: "Messages",
    url: "/user/messages",
    icon: MessageCircle,
  },
  {
    title: "Notifications",
    url: "#",
    icon: BellDotIcon,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="flex flex-col justify-between mb-8">
        <SidebarGroup>
          <div className="cursor-pointer">
            <Image src="/logo.png" width={110} height={110} alt="" />
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <div className="cursor-pointer">
                    <LogOut />
                    <SignOutButton redirectUrl="/sign-in">
                            Sign Out
                    </SignOutButton>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}