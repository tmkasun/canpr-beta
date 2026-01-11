import React from "react";
import { 
  LayoutDashboard, 
  History, 
  Calculator, 
  FileText, 
  Settings, 
  Leaf 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
const NAV_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Historical Data", icon: History, path: "/history" },
  { title: "CRS Calculator", icon: Calculator, path: "/calculator" },
  { title: "Insights", icon: FileText, path: "/insights" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Leaf className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">MapleMetrics</span>
            <span className="text-[10px] text-muted-foreground">Canada PR Analytics</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.path}
                  tooltip={item.title}
                >
                  <Link to={item.path} className="flex items-center gap-3">
                    <item.icon className={cn(
                      "size-4",
                      location.pathname === item.path ? "text-red-600" : "text-foreground/70"
                    )} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <Settings className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Settings</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}