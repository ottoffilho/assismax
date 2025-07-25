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

  // Buscar dados do funcionário usando função RPC segura
  const fetchFuncionario = useCallback(async (userId: string, userEmail?: string) => {
    try {
      console.log('🔍 Buscando funcionário via RPC segura, email:', userEmail);

      if (!userEmail) {
        throw new Error('Email não fornecido para busca de funcionário');
      }

      // Usar a função RPC que bypassa RLS para verificação de login
      const { data, error } = await supabase.rpc('verify_user_login', {
        email_param: userEmail
      });

      if (error) {
        console.error('❌ Erro ao buscar funcionário:', error);
        throw new Error(`Erro na verificação: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('❌ Funcionário não encontrado para email:', userEmail);
        throw new Error('Funcionário não encontrado ou inativo');
      }

      const funcionarioData = data[0];
      
      // Converter para formato completo do funcionário
      const funcionarioCompleto: Funcionario = {
        id: funcionarioData.user_id, // Usando user_id como ID temporariamente
        nome: funcionarioData.nome,
        email: userEmail,
        nivel_acesso: funcionarioData.nivel_acesso as 'admin' | 'funcionario',
        ativo: funcionarioData.ativo,
        user_id: funcionarioData.user_id
      };

      console.log('✅ Funcionário encontrado:', funcionarioCompleto);
      setFuncionario(funcionarioCompleto);
      return funcionarioCompleto;
    } catch (error) {
      console.error('❌ Erro na fetchFuncionario:', error);
      setFuncionario(null);
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

    // Debounce para evitar processamento simultâneo
    let authChangeTimeout: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isCancelled || isProcessing) return;

      console.log('🔄 Auth state change:', event, session?.user?.email);

      // Evitar processar eventos desnecessários
      if (event === 'INITIAL_SESSION') return;
      
      // Debounce para evitar race conditions
      clearTimeout(authChangeTimeout);
      authChangeTimeout = setTimeout(async () => {

      if (event === 'SIGNED_IN' && session?.user) {
        isProcessing = true;
        setUser(session.user);
        try {
          const func = await fetchFuncionario(session.user.id, session.user.email);
          // Redirecionar sempre após login bem-sucedido
          if (func) {
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
      }
      }, 100); // 100ms debounce
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