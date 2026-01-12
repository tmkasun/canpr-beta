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
        <SidebarInset className={cn("flex flex-col min-h-screen bg-background transition-colors duration-300", className)}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-md shadow-sm">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex-1 overflow-hidden">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:inline-flex">
                    <BreadcrumbLink asChild>
                      <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:inline-flex" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="truncate font-bold tracking-tight text-foreground">{pageName}</BreadcrumbPage>
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