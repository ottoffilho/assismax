import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  nivel_acesso: 'admin' | 'funcionario';
  empresa_id: string;
  ativo: boolean;
  user_id?: string; // Nova coluna para ligação com auth.users
}

interface AuthContextType {
  user: User | null;
  funcionario: Funcionario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isValidUser: boolean; // Novo: usuário está autenticado no Supabase Auth
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = !!user && !!funcionario;
  const isValidUser = !!user; // Usuário logado no Supabase Auth (independente do funcionário)
  const isAdmin = funcionario?.nivel_acesso === 'admin';

  // Buscar dados do funcionário baseado no user_id ou email do usuário autenticado
  const fetchFuncionario = useCallback(async (userEmail: string, userId?: string) => {
    try {
      // Timeout de 5 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na busca do funcionário')), 5000)
      );

      let query = supabase.from('funcionarios').select('*').eq('ativo', true);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('email', userEmail);
      }

      const queryPromise = query.single();
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        throw new Error(`Erro ao buscar funcionário: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Funcionário não encontrado ou inativo.`);
      }

      setFuncionario(data as Funcionario);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Verificar sessão atual (função para uso manual)
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        try {
          await fetchFuncionario(session.user.email!, session.user.id);
        } catch (error) {
          console.error('Erro ao buscar funcionário na verificação manual:', error);
          setFuncionario(null);
        }
      } else {
        setUser(null);
        setFuncionario(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setFuncionario(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        throw error;
      }

      if (data.user) {
        // Buscar funcionário imediatamente após login
        try {
          const funcionario = await fetchFuncionario(data.user.email!, data.user.id);
          // Redirecionar baseado no nível de acesso
          const redirectTo = funcionario.nivel_acesso === 'admin' ? '/admin' : '/funcionarios';
          navigate(redirectTo);
        } catch (fetchError) {
          throw new Error('Usuário não encontrado no sistema');
        }
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verifique suas credenciais';
      toast({
        title: 'Erro ao fazer login',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      setFuncionario(null);
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer logout';
      toast({
        title: 'Erro ao fazer logout',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Monitorar mudanças de autenticação
  useEffect(() => {
    let isCancelled = false;
    
    // Função para verificar auth uma única vez
    const initAuth = async () => {
      if (isCancelled) return;
      
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isCancelled) return;
        
        if (session?.user) {
          setUser(session.user);
          try {
            await fetchFuncionario(session.user.email!, session.user.id);
          } catch (error) {
            if (!isCancelled) {
              setFuncionario(null);
            }
          }
        } else {
          if (!isCancelled) {
            setUser(null);
            setFuncionario(null);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setUser(null);
          setFuncionario(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        try {
          const func = await fetchFuncionario(session.user.email!, session.user.id);
          // Redirecionar após login bem-sucedido
          if (func && window.location.pathname === '/login') {
            const redirectTo = func.nivel_acesso === 'admin' ? '/admin' : '/funcionarios';
            navigate(redirectTo);
          }
        } catch (error) {
          setFuncionario(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFuncionario(null);
        navigate('/login');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, []); // REMOVIDO fetchFuncionario das dependências

  return (
    <AuthContext.Provider
      value={{
        user,
        funcionario,
        isLoading,
        isAuthenticated,
        isValidUser,
        isAdmin,
        signIn,
        signOut,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}