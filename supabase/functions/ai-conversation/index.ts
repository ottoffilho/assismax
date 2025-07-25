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
  conversation_state?: {
    stage: string;
    sales_questions_count: number;
    sales_questions_limit: number;
  };
}

// Função para buscar TODOS os produtos reais cadastrados
async function getAllProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('nome, categoria, descricao, preco_varejo, preco_atacado, estoque')
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  console.log('Produtos encontrados:', data?.length || 0);
  return data || [];
}

// Função para buscar produtos específicos por termo
async function searchProdutos(query: string, limit: number = 10) {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

  // Se não há termos de busca específicos, retorna todos os produtos
  if (searchTerms.length === 0) {
    return await getAllProdutos();
  }

  // Busca na tabela produtos real
  const { data, error } = await supabase
    .from('produtos')
    .select('nome, categoria, descricao, preco_varejo, preco_atacado, estoque')
    .eq('ativo', true)
    .or(`nome.ilike.%${searchTerms.join('%')}, categoria.ilike.%${searchTerms.join('%')}, descricao.ilike.%${searchTerms.join('%')}`)
    .order('nome', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return data || [];
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

// Função para detectar perguntas off-topic (fora do contexto AssisMax)
function isOffTopicQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Tópicos permitidos (contexto AssisMax)
  const allowedTopics = [
    'preço', 'preco', 'valor', 'custa', 'quanto',
    'produto', 'arroz', 'feijão', 'feijao', 'café', 'cafe', 'leite', 'óleo', 'oleo',
    'atacado', 'atacarejo', 'comprar', 'vender', 'economia', 'desconto',
    'entrega', 'entregar', 'frete', 'envio',
    'pagamento', 'pagar', 'cartão', 'cartao', 'pix', 'dinheiro',
    'horário', 'horario', 'funcionamento', 'abre', 'fecha',
    'loja', 'endereço', 'endereco', 'onde', 'localização', 'localizacao',
    'whatsapp', 'telefone', 'contato',
    'quantidade', 'estoque', 'disponível', 'disponivel',
    'qualidade', 'marca', 'categoria'
  ];
  
  // Tópicos claramente off-topic
  const offTopicKeywords = [
    'política', 'politica', 'governo', 'eleição', 'eleicao',
    'futebol', 'esporte', 'jogo', 'time',
    'novela', 'filme', 'música', 'musica', 'cantor',
    'saúde', 'saude', 'médico', 'medico', 'doença', 'doenca',
    'receita', 'culinária', 'culinaria', 'cozinha',
    'tempo', 'clima', 'chuva', 'sol',
    'piada', 'história', 'historia', 'conte',
    'amor', 'relacionamento', 'namoro',
    'trabalho', 'emprego', 'carreira',
    'estudo', 'escola', 'universidade'
  ];
  
  // Se contém palavras permitidas, não é off-topic
  const hasAllowedTopic = allowedTopics.some(topic => lowerMessage.includes(topic));
  if (hasAllowedTopic) return false;
  
  // Se contém palavras claramente off-topic, é off-topic
  const hasOffTopic = offTopicKeywords.some(keyword => lowerMessage.includes(keyword));
  if (hasOffTopic) return true;
  
  // Se é uma pergunta muito genérica sem contexto específico
  const genericQuestions = [
    'como você está', 'como vai', 'tudo bem',
    'que horas são', 'que dia é hoje',
    'me fale sobre', 'conte-me sobre',
    'qual sua opinião', 'o que você acha'
  ];
  
  return genericQuestions.some(generic => lowerMessage.includes(generic));
}

// Função para determinar se deve coletar dados do usuário
function shouldCollectData(conversation_history: ConversationMessage[], user_data: { nome?: string; telefone?: string; email?: string } | undefined): boolean {
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
    const { message, conversation_history, user_data, conversation_state } = await req.json() as ConversationRequest;

    // Detectar intenções na mensagem
    const intents = detectIntent(message);

    // SEMPRE buscar TODOS os produtos reais cadastrados
    const produtosReais = await getAllProdutos();

    // Buscar informações relevantes na base de conhecimento (EXCETO produtos)
    const knowledgeResults = await searchKnowledgeBase(message);

    // Verificar se está no modo vendas
    const isSalesMode = conversation_state?.stage === 'sales_mode';
    
    // Verificar se a pergunta é off-topic (apenas no modo vendas)
    if (isSalesMode && isOffTopicQuestion(message)) {
      return new Response(JSON.stringify({
        success: true,
        response: `Oi ${user_data?.nome || 'querida'}! 😊 Meu trabalho aqui é te ajudar com informações sobre nossos produtos e vantagens do atacarejo. Sobre outros assuntos, nossa equipe no WhatsApp pode te ajudar melhor! Que tal conhecer nossos preços especiais de ${produtosReais.length > 0 ? produtosReais[0].nome : 'atacado'}? 💰`,
        intents: ['off_topic_redirect'],
        produtos_reais_cadastrados: produtosReais.length,
        next_actions: ['redirect_to_products'],
        should_collect_data: false
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Construir contexto da conversa
    let systemPrompt;
    
    if (isSalesMode) {
      // Prompt especializado para modo vendas
      systemPrompt = `Você é o Assis, dono da AssisMax Atacarejo em Valparaíso de Goiás.
O cliente ${user_data?.nome} já demonstrou interesse e você agora é um VENDEDOR ACOLHEDOR focado em ajudar dona de casa.

MODO VENDAS ATIVO:
- Cliente já cadastrou interesse
- Pergunta ${conversation_state?.sales_questions_count + 1} de ${conversation_state?.sales_questions_limit}
- Seja vendedor gentil mas direto
- Foque na ECONOMIA e VANTAGENS do atacarejo

PRODUTOS REAIS DISPONÍVEIS (${produtosReais.length} produtos):
${produtosReais.length > 0 ? produtosReais.map(produto => `
🛒 ${produto.nome} (${produto.categoria})
   ${produto.descricao || ''}
   💰 Varejo: R$ ${produto.preco_varejo || 'Consulte'} | Atacado: R$ ${produto.preco_atacado || 'Consulte'}
   📦 Temos ${produto.estoque || 0} unidades em estoque
   💡 ECONOMIA: R$ ${(parseFloat(produto.preco_varejo || '0') - parseFloat(produto.preco_atacado || '0')).toFixed(2)} por unidade
`).join('\n') : 'Produtos sendo atualizados no sistema'}

REGRAS DO MODO VENDAS:
1. APENAS responda sobre produtos AssisMax, preços, vantagens atacarejo
2. Use DADOS REAIS dos produtos listados acima
3. Destaque sempre a ECONOMIA (diferença varejo vs atacado)
4. Tom: gentil, regional de Goiás, como vizinho prestativo
5. Se pergunta 4: avisar "você tem mais uma pergunta!"
6. Fale como vendedor experiente para dona de casa
7. NUNCA invente produtos ou preços

CONTEXTO ATUAL:
- Cliente: ${user_data?.nome}
- Pergunta atual: ${conversation_state?.sales_questions_count + 1}/${conversation_state?.sales_questions_limit}
- Produtos disponíveis: ${produtosReais.length}
- Foco: economia familiar comprando no atacarejo`;
    } else {
      // Prompt original para captura de dados
      systemPrompt = `Você é o Assis, proprietário da AssisMax Atacarejo em Valparaíso de Goiás.

PERSONALIDADE:
- Acolhedor e próximo (dono do negócio)
- Linguagem simples e regional de Goiás
- Sempre mencione economia e preços justos
- Seja genuíno e prestativo

PRODUTOS REAIS CADASTRADOS NO SISTEMA (TOTAL: ${produtosReais.length}):
${produtosReais.length > 0 ? produtosReais.map(produto => `
📦 ${produto.nome} (${produto.categoria})
   ${produto.descricao || ''}
   💰 Preço Varejo: R$ ${produto.preco_varejo || 'Consulte'}
   🏪 Preço Atacado: R$ ${produto.preco_atacado || 'Consulte'}
   📦 Estoque: ${produto.estoque || 0} unidades
`).join('\n') : 'NENHUM PRODUTO CADASTRADO NO MOMENTO'}

INFORMAÇÕES COMPLEMENTARES (NÃO SOBRE PRODUTOS):
${knowledgeResults.map(kb => `
${kb.titulo}:
${kb.conteudo}
`).join('\n')}

REGRAS CRÍTICAS:
1. NUNCA invente produtos que não estão na lista acima
2. SEMPRE use apenas os produtos reais cadastrados com preços exatos
3. Se não temos produtos cadastrados, seja honesto: "No momento não temos produtos cadastrados no sistema"
4. Se perguntarem sobre produtos específicos que não temos, diga que não temos no momento
5. Quando perguntarem "quantos produtos", responda: ${produtosReais.length} produtos
6. JAMAIS mencione produtos fictícios ou da base de conhecimento antiga

CONTEXTO ATUAL:
- Usuário: ${user_data?.nome || 'Visitante'}
- Produtos reais cadastrados: ${produtosReais.length}
- Intenções detectadas: ${intents.join(', ') || 'conversa geral'}`;
    }

    // Verificar se deve coletar dados (apenas se não estiver no modo vendas)
    if (!isSalesMode) {
      const needsDataCollection = shouldCollectData(conversation_history, user_data);
      
      if (needsDataCollection && !user_data?.nome) {
        systemPrompt += '\n\nIMPORTANTE: O usuário mostrou interesse. Colete o NOME de forma natural na conversa.';
      } else if (needsDataCollection && !user_data?.telefone) {
        systemPrompt += '\n\nIMPORTANTE: Já temos o nome. Agora colete o TELEFONE/WhatsApp de forma natural.';
      }
    }
    
    // Aviso especial para a 4ª pergunta no modo vendas
    if (isSalesMode && conversation_state?.sales_questions_count === 3) {
      systemPrompt += '\n\n⚠️ AVISO ESPECIAL: Esta é a penúltima pergunta! Avise o cliente que ele tem MAIS UMA PERGUNTA após esta. Seja direto e útil.';
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

    if (isSalesMode) {
      // No modo vendas, apenas incrementar contador
      nextActions.push('increment_sales_counter');
      
      // Se chegou ao limite, preparar para encerramento
      if (conversation_state?.sales_questions_count >= conversation_state?.sales_questions_limit - 1) {
        nextActions.push('prepare_sales_closing');
      }
    } else {
      // Lógica original para captura de dados
      const needsDataCollection = shouldCollectData(conversation_history, user_data);
      
      if (needsDataCollection) {
        if (!user_data?.nome) {
          nextActions.push('collect_name');
        } else if (!user_data?.telefone) {
          nextActions.push('collect_phone');
        } else {
          nextActions.push('send_to_webhook');
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      intents: intents,
      produtos_reais_cadastrados: produtosReais.length,
      produtos_nomes: produtosReais.map(p => p.nome),
      knowledge_used: knowledgeResults.length,
      next_actions: nextActions,
      should_collect_data: isSalesMode ? false : shouldCollectData(conversation_history, user_data),
      sales_mode: {
        active: isSalesMode,
        questions_count: conversation_state?.sales_questions_count || 0,
        questions_limit: conversation_state?.sales_questions_limit || 5,
        is_fourth_question: isSalesMode && conversation_state?.sales_questions_count === 3
      },
      debug: {
        total_produtos_banco: produtosReais.length,
        produtos_encontrados: produtosReais.map(p => `${p.nome} - R$ ${p.preco_atacado}`),
        conversation_stage: conversation_state?.stage || 'unknown'
      }
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