import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Cliente Supabase com permissões de service role
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationRequest {
  message: string;
  conversation_history: ConversationMessage[];
  user_data?: {
    nome?: string;
    telefone?: string;
    email?: string;
  };
}

// Função para gerar embeddings simples (busca por keywords como fallback)
async function searchKnowledgeBase(query: string, limit: number = 3) {
  // Por enquanto vamos usar busca por texto até implementarmos embeddings
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  // Busca por tags e conteúdo
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('titulo, conteudo, categoria, subcategoria, prioridade')
    .eq('ativo', true)
    .or(`conteudo.ilike.%${searchTerms.join('%')}, tags.cs.{${searchTerms.join(',')}}`)
    .order('prioridade', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar knowledge base:', error);
    return [];
  }

  return data || [];
}

// Função para detectar intenções na mensagem
function detectIntent(message: string): string[] {
  const intents = [];
  const lowerMessage = message.toLowerCase();

  // Intenções de produtos
  if (/arroz|arros/.test(lowerMessage)) intents.push('produto_arroz');
  if (/feijão|feijao|fejão/.test(lowerMessage)) intents.push('produto_feijao');
  if (/óleo|oleo|azeite/.test(lowerMessage)) intents.push('produto_oleo');
  if (/café|cafe/.test(lowerMessage)) intents.push('produto_cafe');
  if (/leite/.test(lowerMessage)) intents.push('produto_leite');
  if (/bebida|refrigerante|suco/.test(lowerMessage)) intents.push('produto_bebidas');

  // Intenções de negócio
  if (/preço|preco|valor|custa|quanto/.test(lowerMessage)) intents.push('consulta_preco');
  if (/horario|funcionamento|abre|fecha/.test(lowerMessage)) intents.push('consulta_horario');
  if (/entrega|entregar|frete/.test(lowerMessage)) intents.push('consulta_entrega');
  if (/pagamento|pagar|cartao|pix/.test(lowerMessage)) intents.push('consulta_pagamento');
  if (/cnpj|quantidade|minima/.test(lowerMessage)) intents.push('consulta_requisitos');
  if (/loja|visitar|endereco|onde/.test(lowerMessage)) intents.push('consulta_loja');

  // Intenções de atendimento
  if (/whatsapp|telefone|contato|falar/.test(lowerMessage)) intents.push('solicita_contato');
  if (/comprar|pedido|quero/.test(lowerMessage)) intents.push('interesse_compra');

  return intents;
}

// Função para determinar se deve coletar dados do usuário
function shouldCollectData(conversation_history: ConversationMessage[], user_data: any): boolean {
  // Se já tem nome e telefone, não precisa coletar
  if (user_data?.nome && user_data?.telefone) return false;
  
  // Se a conversa já tem mais de 3 mensagens e mostra interesse, deve coletar
  const userMessages = conversation_history.filter(msg => msg.role === 'user');
  if (userMessages.length >= 2) {
    const lastMessages = conversation_history.slice(-4).map(msg => msg.content).join(' ');
    return /quero|comprar|interesse|preco|valor/.test(lastMessages.toLowerCase());
  }
  
  return false;
}

// Função principal para chamar DeepSeek API
async function callDeepSeekAPI(messages: ConversationMessage[]): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Erro na API DeepSeek: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
}

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      }
    });
  }

  try {
    const { message, conversation_history, user_data } = await req.json() as ConversationRequest;

    // Detectar intenções na mensagem
    const intents = detectIntent(message);
    
    // Buscar informações relevantes na base de conhecimento
    const knowledgeResults = await searchKnowledgeBase(message);
    
    // Construir contexto da conversa
    let systemPrompt = `Você é o Assis, proprietário da AssisMax Atacarejo em Valparaíso de Goiás.

PERSONALIDADE:
- Acolhedor e próximo (dono do negócio)
- Linguagem simples e regional de Goiás
- Sempre mencione economia e preços justos
- Seja genuíno e prestativo

INFORMAÇÕES RELEVANTES PARA ESTA CONVERSA:
${knowledgeResults.map(kb => `
${kb.titulo}:
${kb.conteudo}
`).join('\n')}

INSTRUÇÕES ESPECÍFICAS:
1. Use as informações acima para responder com precisão
2. Sempre mencione preços quando relevante
3. Explique o diferencial de atacado para pessoa física
4. Se perguntarem sobre produtos, use os preços exatos fornecidos
5. Mantenha tom conversacional e amigável
6. Se não souber algo, ofereça para a equipe entrar em contato

CONTEXTO ATUAL:
- Usuário: ${user_data?.nome || 'Visitante'}
- Intenções detectadas: ${intents.join(', ') || 'conversa geral'}`;

    // Verificar se deve coletar dados
    const needsDataCollection = shouldCollectData(conversation_history, user_data);
    
    if (needsDataCollection && !user_data?.nome) {
      systemPrompt += '\n\nIMPORTANTE: O usuário mostrou interesse. Colete o NOME de forma natural na conversa.';
    } else if (needsDataCollection && !user_data?.telefone) {
      systemPrompt += '\n\nIMPORTANTE: Já temos o nome. Agora colete o TELEFONE/WhatsApp de forma natural.';
    }

    // Construir array de mensagens para DeepSeek
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.slice(-6), // Últimas 6 mensagens para contexto
      { role: 'user', content: message }
    ];

    // Chamar DeepSeek API
    const aiResponse = await callDeepSeekAPI(messages);

    // Determinar próximas ações
    const nextActions = [];
    
    if (aiResponse.toLowerCase().includes('whatsapp') || 
        aiResponse.toLowerCase().includes('equipe') ||
        aiResponse.toLowerCase().includes('contato')) {
      nextActions.push('offer_human_contact');
    }

    if (needsDataCollection) {
      if (!user_data?.nome) {
        nextActions.push('collect_name');
      } else if (!user_data?.telefone) {
        nextActions.push('collect_phone');
      } else {
        nextActions.push('send_to_webhook');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      intents: intents,
      knowledge_used: knowledgeResults.length,
      next_actions: nextActions,
      should_collect_data: needsDataCollection
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Erro na função ai-conversation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      response: 'Desculpe, tive um problema técnico. Mas nossa equipe pode te ajudar pelo WhatsApp! 😊'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});