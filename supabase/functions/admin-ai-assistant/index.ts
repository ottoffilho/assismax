import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Cliente Supabase com permissões de service role
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface AdminConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface AdminConversationRequest {
  message: string;
  conversation_history: AdminConversationMessage[];
  user_token?: string;
}

interface QueryResult {
  data: any[];
  query: string;
  description: string;
}

// Rate limiting simples (em produção usar Redis ou similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userEmail: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userEmail);
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(userEmail, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Verificar se o usuário é admin com validações extras
async function verifyAdminAccess(token: string): Promise<{ isValid: boolean; userEmail?: string; userId?: string }> {
  try {
    const supabaseUser = createClient(SUPABASE_URL!, token);
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return { isValid: false };
    }

    // Rate limiting por usuário
    if (!checkRateLimit(user.email!)) {
      console.warn(`Rate limit exceeded for user: ${user.email}`);
      return { isValid: false };
    }

    // Verificar se é admin na tabela funcionarios
    const { data: funcionario, error: funcionarioError } = await supabaseAdmin
      .from('funcionarios')
      .select('nivel_acesso, ativo, id')
      .eq('email', user.email)
      .single();

    if (funcionarioError || !funcionario) {
      console.error('Funcionário não encontrado:', funcionarioError);
      return { isValid: false };
    }

    const isAdmin = funcionario.nivel_acesso === 'admin' && funcionario.ativo;
    
    if (!isAdmin) {
      // Log tentativa de acesso não autorizado
      await logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', user.email!, {
        attempted_resource: 'admin-ai-assistant',
        user_level: funcionario.nivel_acesso,
        user_active: funcionario.ativo
      });
    }

    return { 
      isValid: isAdmin, 
      userEmail: user.email!,
      userId: funcionario.id 
    };
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return { isValid: false };
  }
}

// Log de eventos de segurança
async function logSecurityEvent(eventType: string, userEmail: string, details: any) {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        nome_tabela: 'security_events',
        operacao: eventType,
        dados_novos: {
          user_email: userEmail,
          event_type: eventType,
          details: details,
          timestamp: new Date().toISOString(),
          ip_address: '127.0.0.1' // Em produção, capturar IP real
        },
        usuario_id: userEmail
      });
  } catch (error) {
    console.error('Erro ao registrar evento de segurança:', error);
  }
}

// Registrar consulta no audit log
async function logQuery(query: string, userEmail: string, results: number) {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        nome_tabela: 'admin_chatbot_queries',
        operacao: 'SELECT',
        dados_novos: {
          query: query,
          user_email: userEmail,
          results_count: results,
          timestamp: new Date().toISOString()
        },
        usuario_id: userEmail,
        ip_address: '127.0.0.1'
      });
  } catch (error) {
    console.error('Erro ao registrar query no audit log:', error);
  }
}

// Executar query SQL segura
async function executeSecureQuery(sqlQuery: string, userEmail: string): Promise<QueryResult> {
  try {
    // Sanitizar query - apenas SELECTs são permitidos
    const normalizedQuery = sqlQuery.trim().toLowerCase();
    if (!normalizedQuery.startsWith('select')) {
      throw new Error('Apenas consultas SELECT são permitidas');
    }

    // Verificar se não há operações perigosas
    const dangerousOperations = ['insert', 'update', 'delete', 'drop', 'create', 'alter', 'truncate'];
    if (dangerousOperations.some(op => normalizedQuery.includes(op))) {
      throw new Error('Operações de modificação não são permitidas');
    }

    // Executar query
    const { data, error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: sqlQuery
    });

    if (error) {
      throw new Error(`Erro na consulta SQL: ${error.message}`);
    }

    // Log da consulta
    await logQuery(sqlQuery, userEmail, data?.length || 0);

    return {
      data: data || [],
      query: sqlQuery,
      description: 'Consulta executada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

// Analisar pergunta e gerar SQL
async function generateSQLFromQuestion(question: string): Promise<string> {
  const sqlGenerationPrompt = `Você é um especialista em SQL para um sistema de CRM/atacarejo. 

TABELAS DISPONÍVEIS:
- empresas (id, nome, telefone, email, endereco, ativo, created_at)
- funcionarios (id, empresa_id, nome, email, telefone, nivel_acesso, ativo, created_at)
- leads (id, empresa_id, funcionario_id, nome, telefone, email, origem, status, observacoes, created_at, updated_at)
- conversas (id, lead_id, funcionario_id, canal, tipo, mensagem, lida, timestamp)
- conversas_ia (id, lead_id, mensagem, resposta, timestamp)
- produtos (id, empresa_id, nome, categoria, preco_varejo, preco_atacado, estoque, ativo, created_at)
- consentimentos (id, lead_id, aceite_termos, aceite_marketing, aceite_whatsapp, timestamp)
- metricas (id, empresa_id, tipo, valor, metadata, data, timestamp)

VIEWS DISPONÍVEIS:
- dashboard_proprietario (métricas agregadas)
- performance_funcionarios (performance por funcionário)

PERGUNTA: "${question}"

Gere APENAS uma consulta SQL SELECT válida e segura. Não inclua explicações.
Use sempre empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' para filtrar dados da AssisMax.
Para datas, use DATE_TRUNC e CURRENT_DATE quando necessário.
Ordene os resultados de forma lógica.
Limite a 50 resultados com LIMIT 50.`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: sqlGenerationPrompt }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API DeepSeek: ${response.status}`);
    }

    const result = await response.json();
    const sqlQuery = result.choices?.[0]?.message?.content?.trim();

    if (!sqlQuery) {
      throw new Error('Não foi possível gerar consulta SQL');
    }

    return sqlQuery.replace(/```sql\n?|\n?```/g, '').trim();
  } catch (error) {
    console.error('Erro ao gerar SQL:', error);
    throw new Error('Erro ao processar sua pergunta');
  }
}

// Gerar resposta interpretativa dos dados
async function generateBusinessInsight(question: string, queryResult: QueryResult, conversationHistory: AdminConversationMessage[]): Promise<string> {
  const businessPrompt = `Você é o AssisBot Pro, assistente executivo especializado em:
🎯 MARKETING DIGITAL (funil, ROI, conversões, campanhas)
🏪 GESTÃO DE ATACAREJO (métricas operacionais, estoque, margem)  
👥 GESTÃO DE PESSOAS (performance, produtividade, metas)

CONTEXTO DO NEGÓCIO:
- AssisMax: Atacarejo em Valparaíso-GO
- Modelo: B2C atacado para famílias
- Produtos: Arroz, feijão, óleo, café, leite, bebidas
- Equipe: 3 funcionários + proprietário
- Faturamento: R$ 500k/mês

PERGUNTA DO USUÁRIO: "${question}"

DADOS OBTIDOS:
Query executada: ${queryResult.query}
Resultados (${queryResult.data.length} registros):
${JSON.stringify(queryResult.data.slice(0, 10), null, 2)}

INSTRUÇÕES:
1. Analise os dados com expertise de negócios
2. Forneça insights acionáveis, não apenas números
3. Use linguagem executiva em português
4. Sugira ações concretas baseadas nos dados
5. Contextualize com conhecimento do mercado atacarejo
6. Se há poucos dados, mencione e sugira como melhorar
7. Seja direto e objetivo, máximo 300 palavras

FORMATO DA RESPOSTA:
📊 **Resultado:** [resumo dos números]
💡 **Insights:** [interpretação estratégica]
🎯 **Recomendações:** [ações específicas]`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: businessPrompt },
          ...conversationHistory.slice(-6),
          { role: 'user', content: question }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API DeepSeek: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || 'Desculpe, não consegui analisar os dados no momento.';
  } catch (error) {
    console.error('Erro ao gerar insight:', error);
    return 'Dados obtidos com sucesso, mas houve um problema na análise. Verifique os resultados acima.';
  }
}

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    const { message, conversation_history, user_token } = await req.json() as AdminConversationRequest;

    // Verificar se o token foi fornecido
    if (!user_token) {
      throw new Error('Token de autenticação necessário');
    }

    // Verificar acesso de admin
    const adminCheck = await verifyAdminAccess(user_token);
    if (!adminCheck.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Acesso negado. Apenas administradores podem usar este assistente.',
        response: '🚫 Desculpe, este recurso é exclusivo para administradores do sistema.'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const { userEmail, userId } = adminCheck;

    // Gerar SQL baseado na pergunta
    const sqlQuery = await generateSQLFromQuestion(message);
    
    // Executar query
    const queryResult = await executeSecureQuery(sqlQuery, userEmail!);

    // Gerar insight de negócio
    const businessResponse = await generateBusinessInsight(message, queryResult, conversation_history);

    return new Response(JSON.stringify({
      success: true,
      response: businessResponse,
      query_executed: sqlQuery,
      data_count: queryResult.data.length,
      raw_data: queryResult.data.slice(0, 5) // Apenas primeiros 5 registros para não sobrecarregar
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Erro na função admin-ai-assistant:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      response: `🤖 **AssisBot Pro encontrou um problema:**\n\n${error.message}\n\nTente reformular sua pergunta ou use termos mais específicos sobre leads, funcionários, produtos ou métricas.`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});