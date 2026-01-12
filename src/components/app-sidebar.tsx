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
  useSidebar
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg ring-1 ring-red-500/20">
            <Leaf className="size-5 fill-white/10" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold leading-none truncate tracking-tight">MapleMetrics</span>
            <span className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-wider">Canada PR Terminal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-primary hover:dark:bg-primary/25" 
                        : "hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="font-bold text-xs truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4 bg-muted/20">
        <div className="flex flex-col gap-4 px-2 overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center cursor-help group transition-all",
                isExpanded ? "gap-2" : "justify-center"
              )}>
                <div className={cn(
                  "size-2 shrink-0 rounded-full transition-all duration-500",
                  isFetching ? "bg-primary animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                  isExpanded ? "" : "mx-auto"
                )} />
                {isExpanded && (
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate group-hover:text-foreground">
                      {isFetching ? "Syncing..." : "IRCC Gateway"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 tabular-nums truncate font-bold">
                      {dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "Connecting..."}
                    </span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card text-foreground border-border shadow-xl">
              <p className="text-xs font-bold">Securely connected to official IRCC datasets.</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-3 group cursor-pointer overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
            <Settings className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            {isExpanded && <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground truncate">Preferences</span>}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}