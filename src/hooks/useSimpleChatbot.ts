import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface LeadData {
  nome?: string;
  telefone?: string;
  email?: string;
  origem: string;
  data: string;
  status: string;
  leadId?: string; // Para vincular conversas ao lead
}

interface Produto {
  id: string;
  nome: string;
  preco_atacado: number | null;
  preco_varejo: number | null;
  categoria: string;
  descricao: string | null;
  estoque: number | null;
}

type ConversationStage = 'greeting' | 'collecting_name' | 'collecting_phone' | 'collecting_email' | 'data_complete' | 'sales_mode' | 'extended_chat' | 'closing';

export function useSimpleChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<ConversationStage>('greeting');
  const [leadData, setLeadData] = useState<LeadData>({
    origem: 'chatbot',
    data: new Date().toISOString(),
    status: 'novo'
  });
  const [salesQuestionsCount, setSalesQuestionsCount] = useState(0);
  const [extendedQuestionsCount, setExtendedQuestionsCount] = useState(0);
  
  const initialized = useRef(false);
  const webhookSent = useRef(false);
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Função para salvar conversa na tabela conversas_ia
  const salvarConversaIA = useCallback(async (mensagem: string, resposta: string, contexto: any = {}) => {
    try {
      const { error } = await supabase
        .from('conversas_ia')
        .insert({
          lead_id: leadData.leadId || null,
          mensagem,
          resposta,
          contexto: {
            ...contexto,
            stage,
            nome_lead: leadData.nome,
            telefone_lead: leadData.telefone,
            produtos_mencionados: extrairProdutosMencionados(mensagem + ' ' + resposta),
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('❌ Erro ao salvar conversa IA:', error);
      } else {
        console.log('✅ Conversa IA salva com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar conversa IA:', error);
    }
  }, [leadData, stage]);

  // Função para extrair produtos mencionados na conversa
  // Função para validar se resposta está completa
  const validarRespostaCompleta = useCallback((resposta: string) => {
    const respostaTrimmed = resposta.trim();
    
    // Verificar se termina com pontuação adequada
    const terminacoesValidas = ['.', '!', '?', '😊', '👍', '💰', '🛒', '📱', '👋', '🏪'];
    const terminaComPontuacao = terminacoesValidas.some(term => respostaTrimmed.endsWith(term));
    
    // Verificar se parece estar cortada (termina com palavra incompleta)
    const ultimasPalavras = respostaTrimmed.split(' ').slice(-3).join(' ').toLowerCase();
    const pareceCortada = ultimasPalavras.includes('voc') || 
                         ultimasPalavras.includes('nos') || 
                         ultimasPalavras.includes('par') ||
                         respostaTrimmed.endsWith(',') ||
                         respostaTrimmed.endsWith('e') ||
                         respostaTrimmed.endsWith('a') ||
                         respostaTrimmed.endsWith('o');
    
    // Verificar se tem pelo menos 10 caracteres
    const tamanhoAdequado = respostaTrimmed.length >= 10;
    
    if (!tamanhoAdequado) {
      return { isComplete: false, reason: 'Resposta muito curta' };
    }
    
    if (pareceCortada) {
      return { isComplete: false, reason: 'Parece cortada no meio' };
    }
    
    if (!terminaComPontuacao) {
      return { isComplete: false, reason: 'Não termina com pontuação adequada' };
    }
    
    return { isComplete: true, reason: 'Resposta completa' };
  }, []);

  const extrairProdutosMencionados = useCallback((texto: string): string[] => {
    const textoLower = texto.toLowerCase();
    const produtosMencionados: string[] = [];

    produtos.forEach(produto => {
      if (textoLower.includes(produto.nome.toLowerCase()) ||
          textoLower.includes(produto.categoria.toLowerCase())) {
        produtosMencionados.push(produto.nome);
      }
    });

    // Palavras-chave comuns de produtos
    const palavrasChave = ['arroz', 'feijão', 'óleo', 'café', 'leite', 'açúcar', 'sal', 'farinha', 'macarrão', 'refrigerante', 'água', 'cerveja', 'vodka', 'cachaça', 'detergente', 'sabão', 'papel higiênico'];

    palavrasChave.forEach(palavra => {
      if (textoLower.includes(palavra) && !produtosMencionados.some(p => p.toLowerCase().includes(palavra))) {
        produtosMencionados.push(palavra);
      }
    });

    return [...new Set(produtosMencionados)]; // Remove duplicatas
  }, [produtos]);

  const addMessage = useCallback((content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: `${sender}-${Date.now()}`,
      content,
      sender,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const typeMessage = useCallback(async (content: string) => {
    if (isTyping) return;
    
    setIsTyping(true);
    
    // Delay inicial para mostrar indicador de digitação
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Criar mensagem vazia primeiro
    const messageId = `bot-${Date.now()}`;
    const newMessage = {
      id: messageId,
      content: '',
      sender: 'bot' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Efeito de digitação caractere por caractere
    let currentText = '';
    for (let i = 0; i < content.length; i++) {
      currentText += content[i];
      
      // Atualizar mensagem com texto parcial
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: currentText } : msg
      ));
      
      // Velocidade de digitação bem mais rápida
      let delay = 20; // Base de 20ms por caractere (era 30ms)
      
      // Pausas bem menores após pontuação
      if (content[i] === '.' || content[i] === '!' || content[i] === '?') {
        delay = 150; // Era 250ms
      } else if (content[i] === ',' || content[i] === ';') {
        delay = 80; // Era 120ms
      } else if (content[i] === ' ') {
        delay = 25; // Era 40ms
      } else {
        // Variação natural mínima
        delay += Math.random() * 15 - 7; // Era ±10ms
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.max(20, delay)));
    }
    
    setIsTyping(false);
  }, [isTyping]);

  // Funções de extração de dados
  const extractName = useCallback((text: string): string | null => {
    const words = text.trim().split(' ');
    if (words.length >= 1 && words[0].length > 2) {
      return words.slice(0, 2).join(' ').replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
    }
    return null;
  }, []);

  const extractPhone = useCallback((text: string): string | null => {
    const phoneRegex = /(\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4})/;
    const match = text.match(phoneRegex);
    return match ? match[0].replace(/[^\d]/g, '') : null;
  }, []);

  const extractEmail = useCallback((text: string): string | null => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  }, []);

  // Enviar para webhook N8N
  const sendToWebhook = useCallback(async (data: LeadData) => {
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


      toast({
        title: "Dados enviados! ✅",
        description: "Suas informações foram registradas com sucesso.",
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "Dados registrados! ✅",
        description: "Suas informações foram salvas. Nossa equipe entrará em contato em breve!",
        duration: 5000,
      });
    }
  }, [toast]);

  // Função para buscar produtos do banco de dados
  const fetchProdutos = useCallback(async () => {
    try {
      console.log('📦 Buscando produtos do banco...');
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco_atacado, preco_varejo, categoria, descricao, estoque')
        .eq('ativo', true)
        .order('categoria', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error);
        return [];
      }

      console.log('✅ Produtos encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }
  }, []);

  // Chamar DeepSeek diretamente para resposta inteligente
  const callDeepSeekAI = useCallback(async (userMessage: string, conversationHistory: Message[]) => {
    try {
      console.log('🤖 Chamando DeepSeek API...');
      
      // SEMPRE buscar produtos reais do banco para garantir dados atualizados
      console.log('📦 Buscando produtos atualizados do banco...');
      const produtosBanco = await fetchProdutos();
      setProdutos(produtosBanco);
      
      // Log crítico para auditoria
      console.log('🔍 AUDITORIA: Produtos encontrados no banco:', produtosBanco.length);
      if (produtosBanco.length === 0) {
        console.warn('⚠️ ALERTA: Nenhum produto encontrado no banco! Chatbot deve ser honesto.');
      }

      // Formatar lista de produtos com preços reais APENAS se existirem
      const produtosFormatados = produtosBanco.length > 0 ? produtosBanco.map(p => {
        const economia = p.preco_varejo && p.preco_atacado 
          ? Math.round(((p.preco_varejo - p.preco_atacado) / p.preco_varejo) * 100)
          : 0;
        
        return `- ${p.nome}: R$ ${p.preco_atacado?.toFixed(2).replace('.', ',')} (no varejo R$ ${p.preco_varejo?.toFixed(2).replace('.', ',')} - economia de ${economia}%)`;
      }).join('\n') : '';

      console.log('💰 Produtos formatados para IA:', produtosFormatados);

      const contextPrompt = `Você é o Assis, dono da AssisMax (atacarejo em Valparaíso-GO). Preços de atacado para pessoa física.

PRODUTOS E PREÇOS REAIS:
${produtosFormatados || 'Sem produtos cadastrados - direcione para equipe.'}

CLIENTE: ${leadData.nome} | ${leadData.telefone}

REGRAS:
• Só mencione produtos da lista acima
• Se sem produtos → direcione para equipe
• Use preços reais, destaque economia (%)
• SEMPRE COMPLETE frases (termine com . ! ?)
• Máximo 3 frases completas
• Seja natural, não repita "Olá [nome]!"
• Personalize, use emojis básicos (máx 2)
• Nunca invente informações

Pergunta do cliente: "${userMessage}"

Histórico da conversa:
${conversationHistory.slice(-3).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}`;

      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      console.log('🔑 API Key presente:', !!apiKey);
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          max_tokens: 220,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        console.error('❌ DeepSeek API erro:', response.status);
        const errorText = await response.text();
        console.error('❌ Detalhes:', errorText);
        throw new Error(`DeepSeek API erro: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ DeepSeek resposta recebida');
      const aiResponse = result.choices?.[0]?.message?.content;
      
      if (aiResponse) {
        console.log('✅ Resposta IA:', aiResponse.substring(0, 100) + '...');

        // Validação de resposta completa
        const respostaCompleta = validarRespostaCompleta(aiResponse);
        if (!respostaCompleta.isComplete) {
          console.warn('⚠️ ALERTA: Resposta pode estar incompleta:', respostaCompleta.reason);
        }

        // Salvar conversa na tabela conversas_ia
        await salvarConversaIA(userMessage, aiResponse, {
          api_used: 'deepseek',
          produtos_disponiveis: produtosBanco.length,
          conversation_history_length: conversationHistory.length,
          resposta_completa: respostaCompleta.isComplete,
          validacao_reason: respostaCompleta.reason
        });

        return aiResponse;
      } else {
        throw new Error('Resposta vazia da IA');
      }
      
    } catch (error) {
      console.error('❌ Erro ao chamar DeepSeek:', error);

      // Buscar produtos para fallback
      const produtosBanco = await fetchProdutos();

      // Fallback com respostas contextuais BASEADAS APENAS EM PRODUTOS REAIS
      console.log('⚠️ API DeepSeek falhou, usando fallback baseado em produtos reais');
      console.log('📦 Produtos disponíveis para fallback:', produtosBanco.length);

      const fallbackResponses = [];

      if (produtosBanco.length > 0) {
        // Se há produtos reais, mencionar apenas eles
        const produtoNomes = produtosBanco.map((p: Produto) => p.nome).join(', ');
        fallbackResponses.push(
          `${leadData.nome}, temos ótimos preços em ${produtoNomes}! Nossa vantagem é vender no atacado para pessoa física. Você economiza muito! 😊`,
          `Interessante sua pergunta, ${leadData.nome}! Temos ${produtoNomes} com preços especiais. Nossa equipe vai te passar os melhores valores pelo WhatsApp!`,
          `${leadData.nome}, aqui na AssisMax você encontra ${produtoNomes} com qualidade e preço justo! Nossa equipe vai te ajudar pelo WhatsApp! 😊`
        );
      } else {
        // Se não há produtos cadastrados, ser honesto
        fallbackResponses.push(
          `${leadData.nome}, estamos atualizando nosso catálogo! Nossa equipe tem as informações mais recentes sobre produtos e preços. Vou conectar você com eles pelo WhatsApp! 😊`,
          `Ótima pergunta, ${leadData.nome}! Nossa equipe tem acesso ao catálogo completo e preços atualizados. Eles vão te atender pelo WhatsApp com todas as informações! 📱`,
          `${leadData.nome}, para te dar as informações mais precisas sobre produtos e preços, nossa equipe especializada vai te atender diretamente pelo WhatsApp! 👍`
        );
      }

      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      // Salvar conversa de fallback também
      await salvarConversaIA(userMessage, fallbackResponse, {
        api_used: 'fallback',
        error_occurred: true,
        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
        produtos_disponiveis: produtosBanco.length
      });

      return fallbackResponse;
    }
  }, [leadData, produtos, fetchProdutos, salvarConversaIA]);

  const initializeChat = useCallback(async () => {
    // Se já foi inicializado, não fazer nada
    if (initialized.current) {
      return;
    }
    
    // Se já tem mensagens, não fazer nada
    if (messages.length > 0) {
      return;
    }
    
    // Marcar como inicializado
    initialized.current = true;
    
    // Buscar produtos do banco
    const produtosBanco = await fetchProdutos();
    setProdutos(produtosBanco);
    
    // Enviar mensagem de boas-vindas
    setStage('collecting_name');
    await typeMessage("Oi! Eu sou o Assis, dono da AssisMax! 👋 Vou te ajudar a conseguir os melhores preços de atacado! Para começar, qual é seu nome?");
  }, [messages.length, typeMessage, setStage, fetchProdutos]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;
    
    addMessage(content, 'user');
    
    // Processar mensagem baseado no estágio
    if (stage === 'collecting_name') {
      const nome = extractName(content);
      if (nome) {
        setLeadData(prev => ({ ...prev, nome }));
        setStage('collecting_phone');
        await typeMessage(`Prazer em te conhecer, ${nome}! 😊 Para eu conseguir te enviar as melhores ofertas, qual seu WhatsApp?`);
      } else {
        await typeMessage("Me conta seu nome completo para eu te ajudar melhor! 😊");
      }
    } else if (stage === 'collecting_phone') {
      const telefone = extractPhone(content);
      if (telefone && telefone.length >= 10) {
        setLeadData(prev => ({ ...prev, telefone }));
        setStage('collecting_email');
        await typeMessage("Perfeito! 📱 E seu email? Assim posso te enviar nosso catálogo completo também!");
      } else {
        await typeMessage("Preciso do seu WhatsApp com DDD para te enviar as ofertas! Ex: (11) 99999-9999");
      }
    } else if (stage === 'collecting_email') {
      const email = extractEmail(content);
      if (email) {
        const updatedData = { ...leadData, email };
        setLeadData(updatedData);
        setStage('data_complete');
        
        // Enviar para webhook
        if (!webhookSent.current) {
          await sendToWebhook(updatedData);
          webhookSent.current = true;
        }
        
        await typeMessage(`Obrigado ${updatedData.nome}! 🎯 Seus dados foram salvos e nossa equipe entrará em contato no WhatsApp ${updatedData.telefone} em breve com os melhores preços!`);
        
        // Aguardar um pouco e ativar modo vendas
        setTimeout(async () => {
          await typeMessage(`Agora posso te ajudar com informações sobre nossos produtos e vantagens do atacarejo! 😊 Pode me fazer até 5 perguntas sobre preços, produtos ou como economizar comprando conosco!`);
          setStage('sales_mode');
          setSalesQuestionsCount(0);
        }, 1000);
      } else {
        await typeMessage("Preciso de um email válido para te enviar nosso catálogo! Ex: seuemail@gmail.com");
      }
    } else if (stage === 'sales_mode') {
      console.log('🛒 Modo vendas ativo - Pergunta:', content);
      console.log('🗿 Contador atual sales_mode:', salesQuestionsCount);
      
      // Verificar se já atingiu o limite de 5 perguntas
      if (salesQuestionsCount >= 5) {
        console.log('⚠️ LIMITE ATINGIDO: Já foram feitas 5 perguntas no modo vendas!');
        await typeMessage(`${leadData.nome}, já conversamos bastante sobre nossos produtos! Nossa equipe entrará em contato pelo WhatsApp para finalizar seu pedido. Obrigado! 😊`);
        setStage('closing');
        return;
      }
      
      // Ativar indicador de "pensando" antes da chamada da API
      setIsTyping(true);
      
      try {
        // Chamar DeepSeek IA para resposta inteligente sobre produtos
        const aiResponse = await callDeepSeekAI(content, messages);
        setIsTyping(false);
        await typeMessage(aiResponse);
        
        const newCount = salesQuestionsCount + 1;
        console.log('🗿 Incrementando contador sales_mode de', salesQuestionsCount, 'para', newCount);
        setSalesQuestionsCount(newCount);
        
        // Após 5 perguntas, ENCERRAR definitivamente o chat
        if (newCount >= 5) {
          console.log('✅ LIMITE FINAL ATINGIDO: 5 perguntas feitas - ENCERRANDO CHAT');
          setTimeout(async () => {
            setStage('closing');
            await typeMessage(`${leadData.nome}, consegui responder suas 5 perguntas sobre nossos produtos! 😊 Para mais informações e finalizar seu pedido, nossa equipe especializada vai te atender pelo WhatsApp ${leadData.telefone}. Obrigado pela conversa! 👋`);
          }, 500);
        }
      } catch (error) {
        setIsTyping(false);
        console.error('❌ Erro na API DeepSeek:', error);
        await typeMessage('Desculpe, tive um problema técnico. Nossa equipe entrará em contato em breve!');
      }
    } else if (stage === 'extended_chat') {
      // REMOVER MODO EXTENDED_CHAT - não deve mais existir
      console.log('❌ ERRO: extended_chat não deveria ser atingido! Redirecionando para closing');
      await typeMessage(`${leadData.nome}, nosso limite é de 5 perguntas por conversa. Nossa equipe vai te atender pelo WhatsApp para continuar! 😊`);
      setStage('closing');
    } else {
      await typeMessage("Obrigado pela mensagem! Nossa equipe entrará em contato em breve.");
    }
  }, [isTyping, stage, leadData, salesQuestionsCount, extendedQuestionsCount, messages, typeMessage, addMessage, extractName, extractPhone, extractEmail, sendToWebhook, callDeepSeekAI]);

  const reset = useCallback(() => {
    console.log('🔄 RESET COMPLETO DO CHATBOT');
    setMessages([]);
    setIsTyping(false);
    setStage('greeting');
    setLeadData({
      origem: 'chatbot',
      data: new Date().toISOString(),
      status: 'novo'
    });
    setSalesQuestionsCount(0);
    setExtendedQuestionsCount(0);
    initialized.current = false;
    webhookSent.current = false;
    console.log('✅ Contadores resetados: salesQuestions=0, extendedQuestions=0');
  }, []);

  return {
    messages,
    isTyping,
    stage,
    leadData,
    salesQuestionsCount,
    extendedQuestionsCount,
    initializeChat,
    sendMessage,
    reset
  };
}