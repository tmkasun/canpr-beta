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
    <Sidebar collapsible="icon" className="border-r border-border transition-all duration-300">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-6 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xl shadow-primary/20 ring-1 ring-primary/30 transition-transform hover:scale-105 active:scale-95">
            <Leaf className="size-5.5 fill-white/10" />
          </div>
          <div className="flex flex-col truncate ml-1">
            <span className="text-sm font-black leading-none truncate tracking-tight text-foreground">MapleMetrics</span>
            <span className="text-[9px] text-muted-foreground truncate font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">IRCC Terminal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200 h-10 rounded-xl px-3",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20"
                        : "hover:bg-muted/80 hover:text-foreground text-muted-foreground"
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className={cn(
                        "size-4.5 shrink-0 transition-all",
                        isActive ? "text-primary scale-110" : "group-hover:text-foreground"
                      )} />
                      <span className="font-black text-xs truncate tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4 bg-muted/10">
        <div className="flex flex-col gap-4 px-1 overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center cursor-help group transition-all p-2 rounded-xl hover:bg-muted/30",
                isExpanded ? "gap-3" : "justify-center"
              )}>
                <div className={cn(
                  "size-2 shrink-0 rounded-full transition-all duration-700",
                  isFetching 
                    ? "bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" 
                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]",
                  !isExpanded && "mx-auto"
                )} />
                {isExpanded && (
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest truncate group-hover:text-foreground transition-colors">
                      {isFetching ? "Syncing Feed" : "Gateway Active"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50 tabular-nums truncate font-bold">
                      {dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "Awaiting sync"}
                    </span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card text-foreground border-border shadow-2xl rounded-xl">
              <p className="text-xs font-bold px-1 py-0.5">Verified connection to IRCC servers.</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-3 group cursor-pointer overflow-hidden opacity-40 hover:opacity-100 transition-all p-2 rounded-xl hover:bg-muted/30">
            <Settings className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-all" />
            {isExpanded && <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground truncate">Preferences</span>}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}