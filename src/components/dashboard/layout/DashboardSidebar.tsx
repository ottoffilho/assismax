import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Package,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import logoHorizontalDark from '@/assets/logo/logo-horizontal-dark.png';
import logoDark from '@/assets/logo/logo-dark.png';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: string;
  onClick?: () => void;
}

interface DashboardSidebarProps {
  isCollapsed?: boolean;
}

export function DashboardSidebar({ isCollapsed = false }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, funcionario, signOut } = useAuth();
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const isAdmin = funcionario?.nivel_acesso === 'admin' || funcionario?.nivel_acesso === 'OWNER';
  const isFuncionario = funcionario?.nivel_acesso === 'funcionario' || funcionario?.nivel_acesso === 'FUNCIONARIO';

  const adminNavItems: NavItem[] = [
    {
      title: 'Visão Geral',
      onClick: () => navigate('/admin'),
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Leads',
      onClick: () => navigate('/admin?tab=leads'),
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Funcionários',
      onClick: () => navigate('/admin?tab=funcionarios'),
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      title: 'Relatórios',
      onClick: () => navigate('/admin?tab=relatorios'),
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const funcionarioNavItems: NavItem[] = [
    {
      title: 'Meus Leads',
      onClick: () => navigate('/funcionarios'),
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Novos Leads',
      onClick: () => navigate('/funcionarios?tab=novos-leads'),
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      title: 'Performance',
      onClick: () => navigate('/funcionarios?tab=performance'),
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  const navItems = isAdmin ? adminNavItems : funcionarioNavItems;

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.title);
    
    // Verificar se é a rota ativa
    let isActive = false;
    if (item.onClick) {
      // Para admin dashboard
      if (location.pathname === '/admin') {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        
        if (item.title === 'Visão Geral' && !tab) {
          isActive = true;
        } else if (item.title === 'Leads' && tab === 'leads') {
          isActive = true;
        } else if (item.title === 'Funcionários' && tab === 'funcionarios') {
          isActive = true;
        } else if (item.title === 'Relatórios' && tab === 'relatorios') {
          isActive = true;
        }
      }
      
      // Para funcionario dashboard
      if (location.pathname === '/funcionarios') {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        
        if (item.title === 'Meus Leads' && !tab) {
          isActive = true;
        } else if (item.title === 'Novos Leads' && tab === 'novos-leads') {
          isActive = true;
        } else if (item.title === 'Performance' && tab === 'performance') {
          isActive = true;
        }
      }
    }

    if (hasChildren && !isCollapsed) {
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleItem(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between hover:bg-gray-800 hover:text-white",
                depth > 0 && "pl-8"
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                <span>{item.title}</span>
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Se tem filhos mas está collapsed, renderiza como item simples
    if (hasChildren && isCollapsed) {
      const buttonContent = (
        <Button
          key={item.title}
          variant="ghost"
          onClick={item.onClick}
          className={cn(
            "w-full justify-center px-2 hover:bg-gray-800 hover:text-white",
            isActive && "bg-accent text-primary"
          )}
        >
          {item.icon}
        </Button>
      );

      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    const buttonContent = (
      <Button
        key={item.title}
        variant="ghost"
        onClick={item.onClick}
        className={cn(
          "w-full hover:bg-gray-800 hover:text-white",
          isCollapsed ? "justify-center px-2" : "justify-start gap-3",
          depth > 0 && !isCollapsed && "pl-8",
          isActive && "bg-accent text-primary"
        )}
      >
        {item.icon}
        {!isCollapsed && (
          <>
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-accent text-primary px-2 py-1 rounded">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Button>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-primary text-white">
        {/* Logo */}
        <div className={cn(isCollapsed ? "p-3 flex justify-center" : "p-6 flex justify-center")}>
          {isCollapsed ? (
            <img 
              src={logoDark} 
              alt="ASSISMAX" 
              className="h-10 w-10"
            />
          ) : (
            <img 
              src={logoHorizontalDark} 
              alt="ASSISMAX Atacarejo" 
              className="h-16 w-auto"
            />
          )}
        </div>

        {/* User Info */}
        <div className={cn(isCollapsed ? "p-3" : "p-6")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-primary font-semibold">
                {funcionario?.nome?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="font-medium text-sm">{funcionario?.nome || 'Usuário'}</p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? 'Administrador' : 'Funcionário'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1 overflow-y-auto", isCollapsed ? "p-2" : "p-4")}>
          {navItems.map(item => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className={cn(isCollapsed ? "p-2" : "p-4")}>
          {isCollapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full justify-center hover:bg-gray-800 hover:text-white mb-2"
                    onClick={() => navigate('/')}
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Voltar ao Site</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full justify-center hover:bg-gray-800 hover:text-white text-red-400 hover:text-red-300"
                    onClick={signOut}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-gray-800 hover:text-white"
                onClick={() => navigate('/')}
              >
                <Settings className="w-5 h-5" />
                <span>Voltar ao Site</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-gray-800 hover:text-white text-red-400 hover:text-red-300"
                onClick={signOut}
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}