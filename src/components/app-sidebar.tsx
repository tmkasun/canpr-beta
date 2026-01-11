import React from "react";
import {
  LayoutDashboard,
  History,
  Calculator,
  FileText,
  Settings,
  Leaf,
  RefreshCw
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
  useSidebar
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDrawData } from "@/hooks/use-draw-data";
import { format } from "date-fns";
const NAV_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Historical Data", icon: History, path: "/history" },
  { title: "CRS Calculator", icon: Calculator, path: "/calculator" },
  { title: "Insights", icon: FileText, path: "/insights" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { dataUpdatedAt, isFetching } = useDrawData();
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg">
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
                  className={cn(
                    location.pathname === item.path && "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  )}
                >
                  <Link to={item.path} className="flex items-center gap-3">
                    <item.icon className={cn(
                      "size-4",
                      location.pathname === item.path ? "text-red-600" : "text-muted-foreground"
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
        <div className="flex flex-col gap-4 px-2">
          {isExpanded && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help group">
                    <div className={cn(
                      "size-2 rounded-full transition-all duration-500", 
                      isFetching ? "bg-red-600 animate-ping" : "bg-emerald-500"
                    )} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {isFetching ? "Refreshing..." : "IRCC Secure Link"}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 tabular-nums">
                        {dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "Connecting..."}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Securely connected to the official IRCC data gateway.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="flex items-center gap-3 group cursor-pointer">
            <Settings className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {isExpanded && <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Preferences</span>}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}