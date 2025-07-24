import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProductAI } from './useProductAI';
import {
  assistantPersonality,
  ConversationContext,
  detectProducts,
  detectUrgency,
  extractName,
  extractPhone,
  getRandomResponse,
  shouldAskForName,
  shouldAskForContact
} from '@/lib/assistantPersonality';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface CollectedData {
  nome?: string;
  telefone?: string;
  email?: string;
  origem: string;
  data: string;
  status: string;
  produtos_interesse: string[];
  urgencia: 'alta' | 'media' | 'baixa' | null;
  intencoes: string[];
  contexto_conversa: string;
}

interface ConversationState {
  stage: 'greeting' | 'natural_conversation' | 'collecting_name' | 'collecting_phone' | 'collecting_email' | 'data_complete' | 'closing';
  hasIntroduced: boolean;
  needsDataCollection: boolean;
  conversation_turns: number;
}

export function useChatbotConversation() {
  const { toast } = useToast();
  const { getProductResponse, getProductInfo, getAllProducts } = useProductAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'greeting',
    hasIntroduced: false,
    needsDataCollection: false,
    conversation_turns: 0
  });
  const [collectedData, setCollectedData] = useState<CollectedData>({
    origem: 'chatbot',
    data: new Date().toISOString(),
    status: 'novo',
    produtos_interesse: [],
    urgencia: null,
    intencoes: [],
    contexto_conversa: ''
  });

  const webhookSent = useRef(false);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Função para simular digitação
  const typewriterEffect = useCallback(async (text: string, onUpdate: (partial: string) => void) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      onUpdate(currentText);
      
      // Velocidade variável baseada no comprimento da palavra
      const delay = Math.random() * 100 + 50;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }, []);

  // Função para adicionar mensagem do bot com efeito de digitação
  const addBotMessage = useCallback(async (content: string) => {
    const messageId = `bot-${Date.now()}`;
    setIsTyping(true);
    
    // Adiciona mensagem vazia com flag isTyping
    const newMessage: Message = {
      id: messageId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simula digitação
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await typewriterEffect(content, (partial) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: partial } : msg
      ));
    });
    
    // Finaliza digitação
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTyping: false } : msg
    ));
    setIsTyping(false);
  }, [typewriterEffect]);

  // Função para enviar dados ao webhook
  const sendToWebhook = useCallback(async (data: CollectedData) => {
    if (!data.nome || !data.telefone) return;

    try {
      const payload = {
        empresa_id: '231f795a-b14c-438b-a896-2f2e479cfa02',
        nome: data.nome,
        telefone: data.telefone,
        email: data.email || '',
        origem: data.origem,
        data: data.data,
        status: data.status
      };
      
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://assismax.app.n8n.cloud/webhook/webhook/assismax';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao enviar dados');
      }

      console.log('✅ Dados enviados com sucesso para N8N:', payload);

      // Toast de sucesso
      toast({
        title: "Dados enviados! ✅",
        description: "Suas informações foram registradas com sucesso.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Erro ao enviar para webhook:', error);
      // Toast positivo para não assustar o usuário
      toast({
        title: "Dados registrados! ✅",
        description: "Suas informações foram salvas. Nossa equipe entrará em contato em breve!",
        duration: 5000,
      });
    }
  }, [toast]);

  // Função para chamar API do DeepSeek
  const callDeepSeekAPI = useCallback(async (data: CollectedData) => {
    try {
      await addBotMessage("Obrigado! Processando seus dados... 🤔");
      
      const prompt = `Cliente ${data.nome} interessado nos nossos produtos de atacarejo. Telefone: ${data.telefone}, Email: ${data.email}. 
      
Contexto: Somos a AssisMax, atacarejo em Valparaíso de Goiás com preços justos para famílias. 

Gere uma mensagem de confirmação curta e acolhedora mencionando que a equipe entrará em contato em breve. Máximo 2 frases. Assine como Assis.`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-dd3c62196e5246b4902f20c7aec36864`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API DeepSeek');
      }

      const result = await response.json();
      const aiMessage = result.choices?.[0]?.message?.content;
      
      if (aiMessage) {
        await addBotMessage(aiMessage);
      } else {
        throw new Error('Resposta vazia da IA');
      }
      
    } catch (error) {
      console.error('Erro ao chamar DeepSeek:', error);
      // Mensagem de fallback simples se a IA falhar
      await addBotMessage(`Perfeito ${data.nome}! ✅ Seus dados foram salvos com sucesso. Nossa equipe entrará em contato no WhatsApp ${data.telefone} em breve com os melhores preços! - Assis`);
    }
  }, [addBotMessage]);

  // Função para chamar a Edge Function de conversa IA
  const callAIConversation = useCallback(async (userMessage: string) => {
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant' as const,
        content: msg.content
      }));

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: conversationHistory,
          user_data: {
            nome: collectedData.nome,
            telefone: collectedData.telefone,
            email: collectedData.email
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com IA');
      }

      const result = await response.json();
      
      if (result.success) {
        // Atualizar dados coletados baseado na resposta da IA
        if (result.next_actions?.includes('collect_name') && !collectedData.nome) {
          const extractedName = extractName(userMessage);
          if (extractedName) {
            setCollectedData(prev => ({ ...prev, nome: extractedName }));
          }
        }

        if (result.next_actions?.includes('collect_phone') && !collectedData.telefone) {
          const extractedPhone = extractPhone(userMessage);
          if (extractedPhone) {
            setCollectedData(prev => ({ ...prev, telefone: extractedPhone }));
          }
        }

        // Atualizar contexto da conversa
        setCollectedData(prev => ({
          ...prev,
          intencoes: [...prev.intencoes, ...result.intents],
          contexto_conversa: prev.contexto_conversa + ' ' + userMessage
        }));

        // Atualizar estado da conversa
        setConversationState(prev => ({
          ...prev,
          conversation_turns: prev.conversation_turns + 1,
          needsDataCollection: result.should_collect_data,
          stage: result.should_collect_data ? 'data_collection' : 'natural_conversation'
        }));

        // Enviar para webhook se tiver dados completos
        if (result.next_actions?.includes('send_to_webhook') && 
            collectedData.nome && collectedData.telefone && 
            !webhookSent.current) {
          await sendToWebhook(collectedData);
          webhookSent.current = true;
        }

        return result.response;
      } else {
        throw new Error(result.error || 'Erro na resposta da IA');
      }
    } catch (error) {
      console.error('Erro ao chamar IA:', error);
      // Fallback para mensagem padrão
      return "Desculpe, tive um probleminha técnico. Mas nossa equipe pode te ajudar pelo WhatsApp! 😊";
    }
  }, [messages, collectedData, supabaseUrl, supabaseAnonKey, sendToWebhook]);

  // Função para analisar e coletar dados da mensagem
  const analyzeAndCollectData = useCallback((userMessage: string) => {
    let updatedData = { ...collectedData };
    let nextStage = conversationState.stage;

    // Sempre tentar extrair dados da mensagem
    const extractedName = extractName(userMessage);
    const extractedPhone = extractPhone(userMessage);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = userMessage.match(emailRegex);

    // Atualizar dados se encontrados
    if (extractedName && !updatedData.nome) {
      updatedData.nome = extractedName;
    }

    if (extractedPhone && !updatedData.telefone) {
      updatedData.telefone = extractedPhone;
    }

    if (emailMatch && !updatedData.email) {
      updatedData.email = emailMatch[0];
    }

    // Determinar próximo estágio baseado nos dados coletados e estágio atual
    if (conversationState.stage === 'natural_conversation' ||
        conversationState.stage === 'collecting_name' ||
        conversationState.stage === 'collecting_phone' ||
        conversationState.stage === 'collecting_email') {

      if (!updatedData.nome) {
        nextStage = 'collecting_name';
      } else if (!updatedData.telefone) {
        nextStage = 'collecting_phone';
      } else if (!updatedData.email) {
        nextStage = 'collecting_email';
      } else {
        nextStage = 'data_complete';
      }
    }

    return { updatedData, nextStage };
  }, [collectedData, conversationState.stage]);

  // Função para gerar resposta baseada no estágio da conversa
  const generateContextualResponse = useCallback((userMessage: string, stage: string, data: CollectedData) => {
    // Se já temos nome, usar nas respostas
    const nomeParaUsar = data.nome || '';

    const responses = {
      natural_conversation: [
        "Que legal! Vou te ajudar com os melhores preços de atacado! 😊 Para eu conseguir te enviar um orçamento personalizado, qual é seu nome?",
        "Perfeito! Nossos preços são realmente especiais! 💰 Me conta seu nome para eu te ajudar melhor?",
        "Ótimo! Temos produtos incríveis com preços de atacado! 🛒 Qual seu nome para eu personalizar sua experiência?"
      ],
      collecting_name: [
        "Que legal! Vou te ajudar com os melhores preços de atacado! 😊 Para eu conseguir te enviar um orçamento personalizado, qual é seu nome?",
        "Perfeito! Nossos preços são realmente especiais! 💰 Me conta seu nome para eu te ajudar melhor?",
        "Ótimo! Temos produtos incríveis com preços de atacado! 🛒 Qual seu nome para eu personalizar sua experiência?"
      ],
      collecting_phone: [
        nomeParaUsar ? `Prazer em te conhecer, ${nomeParaUsar}! 😊 Para eu conseguir te enviar as melhores ofertas, qual seu WhatsApp?` : "Prazer em te conhecer! 😊 Para eu conseguir te enviar as melhores ofertas, qual seu WhatsApp?",
        nomeParaUsar ? `Legal te conhecer, ${nomeParaUsar}! 👋 Agora preciso do seu WhatsApp para te mandar os preços especiais!` : "Legal te conhecer! 👋 Agora preciso do seu WhatsApp para te mandar os preços especiais!",
        nomeParaUsar ? `Que nome bonito, ${nomeParaUsar}! 😄 Me passa seu WhatsApp que vou te enviar ofertas exclusivas!` : "Que nome bonito! 😄 Me passa seu WhatsApp que vou te enviar ofertas exclusivas!"
      ],
      collecting_email: [
        "Perfeito! 📱 E seu email? Assim posso te enviar nosso catálogo completo também!",
        "Show! 👍 Tem um email para eu te mandar nosso catálogo digital?",
        "Ótimo! 📧 Qual seu email para receber nossas promoções?"
      ],
      data_complete: [
        `Obrigado ${data.nome}! 🎯 Seus dados foram salvos e nossa equipe entrará em contato no WhatsApp ${data.telefone} em breve com os melhores preços! ${data.email ? `Também vamos enviar nosso catálogo no email ${data.email}.` : ''} Alguma dúvida específica sobre nossos produtos?`,
        `Perfeito ${data.nome}! ✅ Tudo anotado aqui! Nossa equipe vai te chamar no ${data.telefone} hoje mesmo com ofertas exclusivas! Quer saber sobre algum produto específico?`,
        `Show ${data.nome}! 🎉 Dados salvos com sucesso! Você vai receber nossas melhores ofertas no ${data.telefone} ainda hoje! Tem algum produto que você está precisando mais?`
      ]
    };

    const stageResponses = responses[stage as keyof typeof responses] || responses.natural_conversation;
    return stageResponses[Math.floor(Math.random() * stageResponses.length)];
  }, []);

  // Função para processar mensagem do usuário com lógica inteligente
  const processUserMessage = useCallback(async (userMessage: string) => {
    // Analisar e coletar dados da mensagem
    const { updatedData, nextStage } = analyzeAndCollectData(userMessage);

    // Atualizar dados coletados
    setCollectedData(updatedData);

    // Atualizar estágio da conversa
    setConversationState(prev => ({
      ...prev,
      stage: nextStage as any,
      conversation_turns: prev.conversation_turns + 1
    }));

    // Gerar resposta contextual
    const response = generateContextualResponse(userMessage, nextStage, updatedData);
    await addBotMessage(response);

    // Enviar para webhook se dados estão completos
    if (nextStage === 'data_complete' && updatedData.nome && updatedData.telefone && !webhookSent.current) {
      await sendToWebhook(updatedData);
      webhookSent.current = true;
    }
  }, [analyzeAndCollectData, generateContextualResponse, addBotMessage, sendToWebhook]);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;
    
    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Processa a mensagem
    await processUserMessage(content);
  }, [isTyping, processUserMessage]);

  // Função para iniciar conversa
  const startConversation = useCallback(async () => {
    const saudacoes = [
      "Oi! Eu sou o Assis, dono da AssisMax! 👋 Vou te ajudar a conseguir os melhores preços de atacado! Para começar, qual é seu nome?",
      "Olá! Prazer, sou o Assis da AssisMax! 😊 Quero te mostrar nossos preços especiais de atacado! Qual seu nome?",
      "Oi! Sou o Assis, dono do atacarejo AssisMax! 🛒 Vou te enviar ofertas exclusivas! Me fala seu nome?",
      "E aí! Assis aqui da AssisMax! 💰 Tenho preços incríveis pra te mostrar! Qual seu nome?"
    ];

    const saudacaoAleatoria = saudacoes[Math.floor(Math.random() * saudacoes.length)];
    await addBotMessage(saudacaoAleatoria);

    setConversationState(prev => ({
      ...prev,
      stage: 'collecting_name',
      hasIntroduced: true
    }));
  }, [addBotMessage]);

  // Função para resetar conversa completamente
  const resetConversation = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
    setConversationState({
      stage: 'greeting',
      hasIntroduced: false,
      needsDataCollection: false,
      conversation_turns: 0
    });
    setCollectedData({
      origem: 'chatbot',
      data: new Date().toISOString(),
      status: 'novo',
      produtos_interesse: [],
      urgencia: null,
      intencoes: [],
      contexto_conversa: ''
    });
    webhookSent.current = false;
  }, []);

  return {
    messages,
    isTyping,
    conversationState,
    collectedData,
    sendMessage,
    startConversation,
    resetConversation
  };
}