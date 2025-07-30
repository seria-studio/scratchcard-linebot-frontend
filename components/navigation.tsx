"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, Users, Trophy, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigation = [
  { name: "刮刮卡管理", href: "/admin/scratch-cards", icon: Gift },
  { name: "用戶管理", href: "/admin/users", icon: Users },
  { name: "刮卡結果", href: "/admin/results", icon: Trophy },
]

interface NavigationProps {
  onLogout?: () => void;
}

export function Navigation({ onLogout }: NavigationProps = {}) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <h2 className="text-xl font-bold text-sidebar-foreground px-2 py-2">刮刮卡管理系統</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {onLogout && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut />
                <span>登出</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
