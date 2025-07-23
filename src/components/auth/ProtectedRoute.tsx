import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { isAuthenticated, user, funcionario, isLoading } = useAuth();
  const isValidUser = !!user;
  const isAdmin = funcionario?.nivel_acesso === 'admin';
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário válido no Supabase Auth, redirecionar para login
  if (!isValidUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // Se usuário está logado no Auth mas não tem funcionário cadastrado
  if (isValidUser && !funcionario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Funcionário Não Encontrado</h1>
          <p className="text-muted-foreground mb-4">
            Sua conta está autenticada, mas você não está cadastrado como funcionário.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Contate o administrador para ser adicionado ao sistema.
          </p>
          <button 
            onClick={() => window.location.href = '/setup'}
            className="text-blue-600 hover:underline text-sm"
          >
            Ou acesse /setup se você é o primeiro administrador
          </button>
        </div>
      </div>
    );
  }

  // Se requer admin mas usuário não é admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Usuário: {funcionario?.nome} ({funcionario?.nivel_acesso})
          </p>
        </div>
      </div>
    );
  }

  // Usuário autenticado e autorizado
  return <>{children}</>;
}