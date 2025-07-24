import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { cn } from '@/lib/utils';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onChatbotToggle?: () => void;
}

export function DashboardLayout({ children, onChatbotToggle }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-72"
      )}>
        <DashboardSidebar 
          isCollapsed={isCollapsed} 
          onChatbotToggle={onChatbotToggle}
        />
        
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent"
          onClick={toggleCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed top-4 left-4 z-40"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <DashboardSidebar 
            isCollapsed={false} 
            onChatbotToggle={onChatbotToggle}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-72"
      )}>
        <main className="min-h-screen">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}