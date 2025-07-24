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
  ativo: boolean;
  user_id: string; // Agora obrigatório - ligação com auth.users
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

  // Buscar dados do funcionário com proteção contra execuções múltiplas
  const fetchFuncionario = useCallback(async (userId: string, userEmail?: string) => {
    try {
      console.log('🔍 Buscando funcionário por user_id:', userId, 'email:', userEmail);

      // Timeout aumentado para 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na busca do funcionário')), 10000)
      );

      // Primeira tentativa: buscar por user_id
      let queryPromise = supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .single();

      let { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      // Se falhou por user_id e temos email, tentar por email como fallback
      if (error && userEmail) {
        console.log('⚠️ Busca por user_id falhou, tentando por email:', userEmail);
        queryPromise = supabase
          .from('funcionarios')
          .select('*')
          .eq('email', userEmail)
          .eq('ativo', true)
          .single();

        const fallbackResult = await Promise.race([queryPromise, timeoutPromise]) as any;
        data = fallbackResult.data;
        error = fallbackResult.error;

        // Se encontrou por email, atualizar user_id
        if (data && !error) {
          console.log('🔄 Sincronizando user_id para funcionário encontrado por email');
          await supabase
            .from('funcionarios')
            .update({ user_id: userId })
            .eq('id', data.id);
          data.user_id = userId; // Atualizar localmente
        }
      }

      if (error) {
        console.error('❌ Erro ao buscar funcionário:', error);
        throw new Error(`Funcionário não encontrado ou inativo: ${error.message}`);
      }

      if (!data) {
        console.error('❌ Funcionário não encontrado para user_id:', userId, 'email:', userEmail);
        throw new Error(`Funcionário não encontrado ou inativo.`);
      }

      console.log('✅ Funcionário encontrado:', data);
      setFuncionario(data as Funcionario);
      return data;
    } catch (error) {
      console.error('❌ Erro na fetchFuncionario:', error);
      setFuncionario(null); // Limpar estado em caso de erro
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
          await fetchFuncionario(session.user.id, session.user.email);
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
          const funcionario = await fetchFuncionario(data.user.id, data.user.email);
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

  // Monitorar mudanças de autenticação com proteção contra race conditions
  useEffect(() => {
    let isCancelled = false;
    let isProcessing = false; // Flag para evitar execuções múltiplas

    // Função para verificar auth uma única vez
    const initAuth = async () => {
      if (isCancelled || isProcessing) return;
      isProcessing = true;

      try {
        setIsLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        if (isCancelled) return;

        if (session?.user) {
          setUser(session.user);
          try {
            await fetchFuncionario(session.user.id, session.user.email);
          } catch (error) {
            if (!isCancelled) {
              console.warn('⚠️ Funcionário não encontrado na inicialização:', error);
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
          console.error('❌ Erro na inicialização:', error);
          setUser(null);
          setFuncionario(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
        isProcessing = false;
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isCancelled || isProcessing) return;

      console.log('🔄 Auth state change:', event, session?.user?.email);

      // Evitar processar eventos desnecessários
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_IN' && session?.user) {
        isProcessing = true;
        setUser(session.user);
        try {
          const func = await fetchFuncionario(session.user.id, session.user.email);
          // Redirecionar apenas se estiver na página de login
          if (func && window.location.pathname === '/login') {
            const redirectTo = func.nivel_acesso === 'admin' ? '/admin' : '/funcionarios';
            navigate(redirectTo);
          }
        } catch (error) {
          console.warn('⚠️ Funcionário não encontrado no login:', error);
          setFuncionario(null);
        } finally {
          isProcessing = false;
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFuncionario(null);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          navigate('/login');
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Apenas atualizar user, não re-buscar funcionário para evitar race conditions
        setUser(session.user);
        console.log('🔄 Token refreshed para:', session.user.email);
      }
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, []); // Sem dependências para evitar re-execuções

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