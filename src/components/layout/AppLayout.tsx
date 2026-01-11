import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/history": "Historical Data",
  "/calculator": "CRS Calculator",
  "/insights": "Insights",
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  const pageName = BREADCRUMB_MAP[location.pathname] || "Page";
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className={cn("flex flex-col min-h-screen", className)}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 overflow-hidden">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:inline-flex">
                    <BreadcrumbLink asChild>
                      <Link to="/">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:inline-flex" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="truncate font-medium">{pageName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ThemeToggle className="static" />
          </header>
          <main className="flex-1 overflow-y-auto">
            {container ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={cn("py-8 md:py-10 lg:py-12", contentClassName)}>
                  {children}
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}