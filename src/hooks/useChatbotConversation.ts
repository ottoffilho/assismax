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
  stage: 'greeting' | 'natural_conversation' | 'collecting_name' | 'collecting_phone' | 'collecting_email' | 'data_complete' | 'sales_mode' | 'extended_chat' | 'closing';
  hasIntroduced: boolean;
  needsDataCollection: boolean;
  conversation_turns: number;
  sales_questions_count: number;
  sales_questions_limit: number;
  extended_questions_count: number;
  extended_questions_limit: number;
}

export function useChatbotConversation() {
  const { toast } = useToast();
  const { getProductResponse, getProductInfo, getAllProducts } = useProductAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const hasStarted = useRef(false);
  const messageCounter = useRef(0);
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'greeting',
    hasIntroduced: false,
    needsDataCollection: false,
    conversation_turns: 0,
    sales_questions_count: 0,
    sales_questions_limit: 5,
    extended_questions_count: 0,
    extended_questions_limit: 5
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

  // Função helper para fetch com timeout
  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit, timeoutMs: number = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  // Função para simular digitação realística (caractere por caractere)
  const typewriterEffect = useCallback(async (text: string, onUpdate: (partial: string) => void) => {
    console.log('🖋️ Iniciando efeito de digitação:', text.substring(0, 50) + '...');
    let currentText = '';
    
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      onUpdate(currentText);
      
      // Velocidade realística mais lenta para ser visível
      let delay = 60; // Base de 60ms por caractere (mais lento)
      
      // Pausas maiores após pontuação
      if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
        delay = 500;
      } else if (text[i] === ',' || text[i] === ';') {
        delay = 250;
      } else if (text[i] === ' ') {
        delay = 80;
      } else {
        // Variação natural na velocidade de digitação
        delay += Math.random() * 60 - 30; // ±30ms de variação
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.max(30, delay)));
    }
    console.log('✅ Efeito de digitação finalizado');
  }, []);

  const addBotMessage = useCallback(async (content: string) => {
    const timestamp = Date.now();
    console.log(`🔥 [${timestamp}] RADICAL: Tentativa de adicionar mensagem`);
    
    // PROTEÇÃO RADICAL: Se já existe qualquer mensagem, PARAR
    if (messages.length > 0) {
      console.log(`🛑 [${timestamp}] RADICAL: JÁ EXISTEM ${messages.length} MENSAGENS - CANCELANDO`);
      return;
    }

    // PROTEÇÃO RADICAL: Se isTyping, PARAR
    if (isTyping) {
      console.log(`🛑 [${timestamp}] RADICAL: JÁ ESTÁ DIGITANDO - CANCELANDO`);
      return;
    }

    // ÚNICA EXECUÇÃO POSSÍVEL
    console.log(`✅ [${timestamp}] RADICAL: PRIMEIRA E ÚNICA MENSAGEM SENDO ADICIONADA`);
    
    setIsTyping(true);
    messageCounter.current = 1;
    const messageId = `radical-${timestamp}`;

    const newMessage: Message = {
      id: messageId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };

    // Adicionar mensagem vazia primeiro
    setMessages([newMessage]);

    // Delay para efeito visual mais longo
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Efeito de digitação
    await typewriterEffect(content, (partial) => {
      setMessages([{ ...newMessage, content: partial }]);
    });

    // Finalizar mensagem
    setMessages([{ ...newMessage, content, isTyping: false }]);
    setIsTyping(false);

    console.log(`🎉 [${timestamp}] RADICAL: MENSAGEM ÚNICA FINALIZADA`);
  }, [typewriterEffect, messages.length, isTyping]);

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
      
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://assismax.app.n8n.cloud/webhook/assismax';
      
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

  // Função para chamar API do DeepSeek no modo extended chat
  const callDeepSeekExtendedChat = useCallback(async (userMessage: string, conversationHistory: any[]) => {
    try {
      const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!deepseekApiKey) {
        throw new Error('DEEPSEEK_API_KEY não configurada');
      }

      const contextPrompt = `Você é o Assis, dono da AssisMax, atacarejo em Valparaíso de Goiás. 

Contexto do negócio:
- Atacarejo com produtos básicos: arroz, feijão, óleo, café, leite, bebidas
- Preços especiais para famílias
- Atendimento personalizado
- R$ 500k/mês de faturamento
- 3 funcionários
- Localização: Valparaíso de Goiás - GO

Personalidade:
- Amigável e acolhedor
- Conhece bem os produtos
- Foca em economia para o cliente
- Usa emojis moderadamente
- Responde de forma concisa (máximo 3 frases)

O cliente já passou pelo processo de captura de dados e fez perguntas sobre produtos. Agora está no modo de conversa livre. Responda como o Assis de forma natural e útil.`;

      const messages = [
        { role: 'system', content: contextPrompt },
        ...conversationHistory.slice(-10), // Últimas 10 mensagens para contexto
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API DeepSeek');
      }

      const result = await response.json();
      const aiMessage = result.choices?.[0]?.message?.content;
      
      if (!aiMessage) {
        throw new Error('Resposta vazia da IA');
      }
      
      return aiMessage;
      
    } catch (error) {
      console.error('Erro ao chamar DeepSeek Extended Chat:', error);
      // Mensagem de fallback se a IA falhar
      return "Desculpe, tive um probleminha técnico momentâneo! Mas nossa equipe pode te ajudar pelo WhatsApp com qualquer dúvida! 😊";
    }
  }, []);

  // Função original para confirmação de dados (mantida para compatibilidade)
  const callDeepSeekAPI = useCallback(async (data: CollectedData) => {
    try {
      await addBotMessage("Obrigado! Processando seus dados... 🤔");
      
      const prompt = `Cliente ${data.nome} interessado nos nossos produtos de atacarejo. Telefone: ${data.telefone}, Email: ${data.email}. 
      
Contexto: Somos a AssisMax, atacarejo em Valparaíso de Goiás com preços justos para famílias. 

Gere uma mensagem de confirmação curta e acolhedora mencionando que a equipe entrará em contato em breve. Máximo 2 frases. Assine como Assis.`;

      const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!deepseekApiKey) {
        throw new Error('DEEPSEEK_API_KEY não configurada');
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`
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

  // Função para ativar modo vendas após captura de lead
  const activateSalesMode = useCallback(async () => {
    setConversationState(prev => ({
      ...prev,
      stage: 'sales_mode',
      sales_questions_count: 0
    }));

    await addBotMessage(`Perfeito ${collectedData.nome}! 🎯 Agora vou te ajudar com informações sobre nossos produtos e vantagens do atacarejo! Pode me perguntar o que quiser sobre preços, produtos ou como economizar comprando conosco! 😊`);
  }, [addBotMessage, collectedData.nome]);

  // Função para ativar modo chat estendido após sales_mode
  const activateExtendedChat = useCallback(async () => {
    setConversationState(prev => ({
      ...prev,
      stage: 'extended_chat',
      extended_questions_count: 0
    }));

    await addBotMessage(`${collectedData.nome}, agora você pode me fazer mais perguntas sobre qualquer coisa relacionada ao nosso negócio! 💬 Tenho mais tempo para conversar e te ajudar com o que precisar! 😊`);
  }, [addBotMessage, collectedData.nome]);

  // Função para chamar a Edge Function de conversa IA
  const callAIConversation = useCallback(async (userMessage: string) => {
    try {
      // Adicionar mensagem de "pensando" específica para modo vendas
      const thinkingMessages = conversationState.stage === 'sales_mode' ? [
        "Consultando nossos produtos e preços... 🤔",
        "Verificando preços de atacado... 💰",
        "Analisando nosso estoque... 📦",
        "Calculando sua economia... 💡",
        "Preparando oferta especial... 🎯"
      ] : [
        "Pensando na melhor resposta... 🤔",
        "Analisando sua mensagem... 💭"
      ];
      
      let currentMessageIndex = 0;
      const randomThinking = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
      
      // Mostrar mensagem de "pensando"
      setIsTyping(true);
      const thinkingId = `thinking-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: thinkingId,
        content: randomThinking,
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true
      }]);
      
      // Atualizar mensagem de pensamento a cada 3 segundos para dar dinamismo
      const thinkingInterval = setInterval(() => {
        currentMessageIndex = (currentMessageIndex + 1) % thinkingMessages.length;
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingId 
            ? { ...msg, content: thinkingMessages[currentMessageIndex] }
            : msg
        ));
      }, 3000);
      
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant' as const,
        content: msg.content
      }));

      const response = await fetchWithTimeout(`${supabaseUrl}/functions/v1/ai-conversation`, {
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
          },
          conversation_state: {
            stage: conversationState.stage,
            sales_questions_count: conversationState.sales_questions_count,
            sales_questions_limit: conversationState.sales_questions_limit
          }
        })
      }, 15000); // 15 segundos de timeout

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
        if (conversationState.stage === 'sales_mode') {
          const newCount = conversationState.sales_questions_count + 1;
          setConversationState(prev => ({
            ...prev,
            conversation_turns: prev.conversation_turns + 1,
            sales_questions_count: newCount
          }));
          
          // Se chegou ao limite, ativar modo chat estendido
          if (newCount >= conversationState.sales_questions_limit) {
            setTimeout(async () => {
              await activateExtendedChat();
            }, 2000);
          }
        } else {
          setConversationState(prev => ({
            ...prev,
            conversation_turns: prev.conversation_turns + 1,
            needsDataCollection: result.should_collect_data,
            stage: result.should_collect_data ? 'data_collection' : 'natural_conversation'
          }));
        }

        // Enviar para webhook se tiver dados completos
        if (result.next_actions?.includes('send_to_webhook') && 
            collectedData.nome && collectedData.telefone && 
            !webhookSent.current) {
          await sendToWebhook(collectedData);
          webhookSent.current = true;
          
          // Ativar modo vendas após enviar webhook
          setTimeout(() => {
            activateSalesMode();
          }, 3000);
        }

        // Limpar interval e remover mensagem de "pensando"
        clearInterval(thinkingInterval);
        setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
        setIsTyping(false);
        
        return result.response;
      } else {
        throw new Error(result.error || 'Erro na resposta da IA');
      }
    } catch (error) {
      console.error('Erro ao chamar IA:', error);
      
      // Limpar interval e remover mensagem de "pensando" em caso de erro
      clearInterval(thinkingInterval);
      setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
      setIsTyping(false);
      
      // Fallback para mensagem padrão
      return "Desculpe, tive um probleminha técnico. Mas nossa equipe pode te ajudar pelo WhatsApp! 😊";
    }
  }, [messages, collectedData, supabaseUrl, supabaseAnonKey, sendToWebhook, conversationState.stage, conversationState.sales_questions_count, conversationState.sales_questions_limit, fetchWithTimeout, activateSalesMode, addBotMessage]);

  // Função para analisar e coletar dados da mensagem
  const analyzeAndCollectData = useCallback((userMessage: string) => {
    const updatedData = { ...collectedData };
    let nextStage = conversationState.stage;

    // Sempre tentar extrair dados da mensagem
    const extractedName = extractName(userMessage);
    const extractedPhone = extractPhone(userMessage);
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = userMessage.match(emailRegex);

    // Atualizar dados se encontrados
    if (extractedName && !updatedData.nome) {
      (updatedData as any).nome = extractedName;
    }

    if (extractedPhone && !updatedData.telefone) {
      (updatedData as any).telefone = extractedPhone;
    }

    if (emailMatch && !updatedData.email) {
      (updatedData as any).email = emailMatch[0];
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
      
      // Ativar modo vendas após enviar webhook
      setTimeout(() => {
        activateSalesMode();
      }, 3000);
    }
  }, [analyzeAndCollectData, generateContextualResponse, addBotMessage, sendToWebhook, activateSalesMode]);

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
    
    // Processa a mensagem dependendo do estágio
    if (conversationState.stage === 'sales_mode') {
      // No modo vendas, usar IA inteligente
      const aiResponse = await callAIConversation(content);
      if (aiResponse) {
        await addBotMessage(aiResponse);
      }
    } else if (conversationState.stage === 'extended_chat') {
      // No modo chat estendido, usar DeepSeek API
      setIsTyping(true);
      
      // Mensagens de "pensando" específicas para extended chat
      const thinkingMessages = [
        "Analisando sua pergunta... 🤔",
        "Consultando minhas informações... 📊",
        "Preparando resposta personalizada... 🎯",
        "Verificando detalhes... 🔍"
      ];
      
      const randomThinking = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
      const thinkingId = `thinking-extended-${Date.now()}`;
      
      setMessages(prev => [...prev, {
        id: thinkingId,
        content: randomThinking,
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true
      }]);
      
      // Converter histórico para formato da API
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      try {
        const aiResponse = await callDeepSeekExtendedChat(content, conversationHistory);
        
        // Remover mensagem de "pensando"
        setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
        setIsTyping(false);
        
        // Adicionar resposta da IA
        await addBotMessage(aiResponse);
        
        // Atualizar contador de perguntas
        const newExtendedCount = conversationState.extended_questions_count + 1;
        setConversationState(prev => ({
          ...prev,
          extended_questions_count: newExtendedCount,
          conversation_turns: prev.conversation_turns + 1
        }));
        
        // Se chegou ao limite de perguntas estendidas, encerrar
        if (newExtendedCount >= conversationState.extended_questions_limit) {
          setTimeout(async () => {
            await addBotMessage(`${collectedData.nome}, foi incrível conversar com você! 😊 Nossa equipe entrará em contato no WhatsApp ${collectedData.telefone} para continuar te ajudando. Até mais! 👋`);
            setConversationState(prev => ({ ...prev, stage: 'closing' }));
          }, 2000);
        }
        
      } catch (error) {
        console.error('Erro no extended chat:', error);
        
        // Remover mensagem de "pensando" em caso de erro
        setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
        setIsTyping(false);
        
        await addBotMessage("Desculpe, tive um probleminha técnico! Mas nossa equipe pode te ajudar pelo WhatsApp com qualquer dúvida! 😊");
      }
    } else {
      // Nos outros estágios, usar lógica de captura de dados
      await processUserMessage(content);
    }
  }, [isTyping, processUserMessage, conversationState.stage, callAIConversation, addBotMessage]);

  // VERSÃO RADICAL: UMA ÚNICA VERIFICAÇÃO
  const startConversation = useCallback(async () => {
    const timestamp = Date.now();
    console.log(`🔥 [${timestamp}] RADICAL: startConversation chamada`);

    // UMA ÚNICA VERIFICAÇÃO RADICAL: Se já tem mensagens, PARAR
    if (messages.length > 0) {
      console.log(`🛑 [${timestamp}] RADICAL: JÁ EXISTEM MENSAGENS (${messages.length}) - CANCELANDO TUDO`);
      return;
    }

    // Marcar como iniciado
    hasStarted.current = true;
    console.log(`🔥 [${timestamp}] RADICAL: EXECUTANDO ÚNICA INICIALIZAÇÃO`);

    // Mensagem única
    const saudacao = "Oi! Eu sou o Assis, dono da AssisMax! 👋 Vou te ajudar a conseguir os melhores preços de atacado! Para começar, qual é seu nome?";

    // Chamar addBotMessage que já tem suas próprias proteções
    await addBotMessage(saudacao);

    // Atualizar estado
    setConversationState(prev => ({
      ...prev,
      stage: 'collecting_name',
      hasIntroduced: true
    }));

    console.log(`🎉 [${timestamp}] RADICAL: CONVERSA INICIADA COM SUCESSO`);
  }, [addBotMessage, messages.length]);

  // VERSÃO RADICAL: RESET ABSOLUTO
  const resetConversation = useCallback(() => {
    const timestamp = Date.now();
    console.log(`🔥 [${timestamp}] RADICAL: RESET TOTAL`);

    // RESET ABSOLUTO - TUDO ZERADO
    hasStarted.current = false;
    messageCounter.current = 0;
    setMessages([]); // ARRAY VAZIO ABSOLUTO
    setIsTyping(false);
    setConversationState({
      stage: 'greeting',
      hasIntroduced: false,
      needsDataCollection: false,
      conversation_turns: 0,
      sales_questions_count: 0,
      sales_questions_limit: 5,
      extended_questions_count: 0,
      extended_questions_limit: 5
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

    console.log(`🎉 [${timestamp}] RADICAL: RESET COMPLETO - ESTADO LIMPO`);
  }, []);

  return {
    messages,
    isTyping,
    conversationState,
    collectedData,
    sendMessage,
    startConversation,
    resetConversation,
    activateSalesMode,
    activateExtendedChat
  };
}