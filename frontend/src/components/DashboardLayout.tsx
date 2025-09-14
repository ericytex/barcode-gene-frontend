import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 border-b border-border/50 glass-effect flex items-center justify-between px-6 shadow-elegant">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-all duration-300 p-2 rounded-lg" />
              <div className="animate-slide-up">
                <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Barcode Generator Pro
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Professional barcode generation platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300 relative group"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-destructive to-warning rounded-full animate-pulse"></div>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300 button-glow"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}