import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AdminMessage, AdminChatbotResponse } from '@/types/admin-chatbot';
import { supabase } from '@/integrations/supabase/client';


export function useAdminChatbot() {
  const { toast } = useToast();
  const { user, funcionario, isAuthenticated: authIsAuthenticated } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const conversationId = useRef(Math.random().toString(36).substring(7));

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Verificar se o usuário está autenticado e é admin
  const isAuthenticated = authIsAuthenticated && (funcionario?.nivel_acesso === 'admin' || funcionario?.nivel_acesso === 'OWNER');

  // Função para simular digitação
  const typewriterEffect = useCallback(async (text: string, onUpdate: (partial: string) => void) => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentText = '';
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const words = sentence.split(' ');
      
      for (let j = 0; j < words.length; j++) {
        currentText += (currentText ? ' ' : '') + words[j];
        onUpdate(currentText);
        
        // Velocidade variável baseada no comprimento da palavra
        const delay = Math.random() * 50 + 30;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Pausa maior entre sentenças
      if (i < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }, []);

  // Função para adicionar mensagem do bot com efeito de digitação
  const addBotMessage = useCallback(async (content: string, metadata?: any) => {
    const messageId = `bot-${Date.now()}`;
    setIsTyping(true);
    
    // Adiciona mensagem vazia
    const newMessage: AdminMessage = {
      id: messageId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      metadata
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simula digitação
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await typewriterEffect(content, (partial) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: partial } : msg
      ));
    });
    
    setIsTyping(false);
  }, [typewriterEffect]);

  // Função para obter token de autenticação seguro
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      // Em produção, usar o token real do usuário autenticado
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }, []);

  // Função para validar permissões antes de enviar
  const validatePermissions = useCallback((): boolean => {
    if (!isAuthenticated) {
      toast({
        title: "❌ Acesso negado",
        description: "Você precisa estar logado para usar o assistente",
        duration: 5000,
      });
      return false;
    }

    if (funcionario?.nivel_acesso !== 'admin' && funcionario?.nivel_acesso !== 'OWNER') {
      toast({
        title: "❌ Acesso restrito",
        description: "Apenas administradores podem usar este recurso",
        duration: 5000,
      });
      return false;
    }

    return true;
  }, [isAuthenticated, funcionario, toast]);

  // Função para chamar a Edge Function admin-ai-assistant
  const callAdminAssistant = useCallback(async (userMessage: string): Promise<AdminChatbotResponse> => {
    try {
      // Validar permissões
      if (!validatePermissions()) {
        throw new Error('Acesso negado');
      }

      // Obter token de autenticação seguro
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error('Token de autenticação não disponível');
      }
      
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant' as const,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));

      const response = await fetch(`${supabaseUrl}/functions/v1/admin-ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'x-conversation-id': conversationId.current,
          'x-user-level': funcionario?.nivel_acesso || 'unknown'
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: conversationHistory,
          user_token: authToken,
          context: {
            user_id: user?.id,
            user_email: user?.email,
            session_id: conversationId.current,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          throw new Error('Acesso negado. Verifique suas permissões.');
        } else if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        } else if (response.status === 429) {
          throw new Error('Muitas solicitações. Aguarde um momento.');
        }
        
        throw new Error(errorData?.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao chamar admin assistant:', error);
      throw error;
    }
  }, [messages, supabaseUrl, validatePermissions, getAuthToken, user]);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping || !isAuthenticated) return;
    
    // Adiciona mensagem do usuário
    const userMessage: AdminMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Chama o assistente administrativo
      const response = await callAdminAssistant(content);
      
      if (response.success) {
        // Adiciona resposta do bot com metadados
        await addBotMessage(response.response, {
          query_executed: response.query_executed,
          data_count: response.data_count,
          raw_data: response.raw_data
        });

        // Toast de sucesso se há dados
        if (response.data_count !== undefined) {
          toast({
            title: "✅ Consulta executada",
            description: `${response.data_count} registros encontrados`,
            duration: 3000,
          });
        }
      } else {
        // Adiciona mensagem de erro
        await addBotMessage(response.response || 'Desculpe, ocorreu um erro ao processar sua solicitação.');
        
        toast({
          title: "⚠️ Problema na consulta",
          description: response.error || "Tente reformular sua pergunta",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      await addBotMessage(
        '🤖 **Ops!** Tive um problema técnico ao processar sua pergunta.\n\n' +
        'Tente novamente ou reformule sua pergunta de forma mais específica sobre leads, funcionários, produtos ou métricas.'
      );
      
      toast({
        title: "❌ Erro de comunicação",
        description: "Não foi possível processar sua solicitação",
        duration: 5000,
      });
    }
  }, [isTyping, isAuthenticated, callAdminAssistant, addBotMessage, toast]);

  // Função para resetar conversa
  const resetConversation = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
    conversationId.current = Math.random().toString(36).substring(7);
    
    toast({
      title: "🔄 Nova conversa iniciada",
      description: "Histórico limpo. Faça sua primeira pergunta!",
      duration: 2000,
    });
  }, [toast]);

  // Função para sugerir perguntas baseadas no contexto
  const getSuggestedQuestions = useCallback(() => {
    const suggestions = [
      "Quantos leads novos chegaram hoje?",
      "Qual funcionário tem a melhor taxa de conversão?",
      "Mostre o funil de conversão desta semana",
      "Quais produtos os leads mais consultam?",
      "Como está nossa performance vs. mês passado?",
      "Leads não respondidos há mais de 24 horas",
      "Funcionários que não atendem há mais tempo",
      "Horários com mais leads capturados",
      "Origem dos leads com melhor conversão",
      "Métricas de hoje vs. ontem"
    ];
    
    return suggestions.sort(() => Math.random() - 0.5).slice(0, 4);
  }, []);

  return {
    messages,
    isTyping,
    isAuthenticated,
    sendMessage,
    resetConversation,
    getSuggestedQuestions
  };
}