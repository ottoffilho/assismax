import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface LeadData {
  nome: string;
  telefone: string;
  email: string;
  empresa?: string;
  aceite_termos: boolean;
  aceite_marketing: boolean;
  aceite_whatsapp: boolean;
}

interface RequestBody {
  lead: LeadData;
  ip_address?: string;
  user_agent?: string;
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse do body
    const { lead, ip_address, user_agent }: RequestBody = await req.json();

    // Validações básicas
    if (!lead || !lead.nome || !lead.telefone || !lead.email || !lead.aceite_termos) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados obrigatórios faltando',
          required: ['nome', 'telefone', 'email', 'aceite_termos']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação de telefone brasileiro (básica)
    const telefoneClean = lead.telefone.replace(/\D/g, '');
    if (telefoneClean.length < 10 || telefoneClean.length > 11) {
      return new Response(
        JSON.stringify({ error: 'Telefone deve ter 10 ou 11 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar empresa padrão (por enquanto assumindo uma empresa)
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('id')
      .eq('ativo', true)
      .limit(1)
      .single();

    if (empresaError || !empresa) {
      console.error('Erro ao buscar empresa:', empresaError);
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se lead já existe (por email ou telefone)
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, telefone')
      .eq('empresa_id', empresa.id)
      .or(`email.eq.${lead.email},telefone.eq.${lead.telefone}`)
      .single();

    if (existingLead) {
      return new Response(
        JSON.stringify({ 
          error: 'Lead já cadastrado',
          message: 'Este email ou telefone já está em nossa base de dados'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir lead
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        empresa_id: empresa.id,
        nome: lead.nome.trim(),
        telefone: telefoneClean,
        email: lead.email.toLowerCase().trim(),
        origem: 'landing_page',
        status: 'novo',
        observacoes: lead.empresa ? `Empresa: ${lead.empresa}` : null,
        dados_adicionais: {
          ip_origem: ip_address,
          user_agent: user_agent,
          timestamp_captacao: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (leadError) {
      console.error('Erro ao inserir lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir consentimentos LGPD
    const { error: consentError } = await supabase
      .from('consentimentos')
      .insert({
        lead_id: newLead.id,
        aceite_termos: lead.aceite_termos,
        aceite_marketing: lead.aceite_marketing || false,
        aceite_whatsapp: lead.aceite_whatsapp || false,
        ip_origem: ip_address,
        user_agent: user_agent,
        politica_versao: '1.0'
      });

    if (consentError) {
      console.error('Erro ao inserir consentimentos:', consentError);
      // Não falha a operação, mas loga o erro
    }

    // Inserir métrica de lead captado
    const { error: metricError } = await supabase
      .from('metricas')
      .insert({
        empresa_id: empresa.id,
        tipo: 'lead_captado',
        valor: 1,
        metadata: {
          origem: 'landing_page',
          lead_id: newLead.id,
          aceite_marketing: lead.aceite_marketing,
          aceite_whatsapp: lead.aceite_whatsapp
        }
      });

    if (metricError) {
      console.error('Erro ao inserir métrica:', metricError);
      // Não falha a operação, mas loga o erro
    }

    // Triggerar automação (chamada para outra Edge Function)
    try {
      const automationResponse = await fetch(`${supabaseUrl}/functions/v1/lead-automation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: newLead.id,
          lead_data: newLead,
          consents: {
            aceite_marketing: lead.aceite_marketing,
            aceite_whatsapp: lead.aceite_whatsapp
          }
        }),
      });

      if (!automationResponse.ok) {
        console.error('Erro na automação:', await automationResponse.text());
      }
    } catch (automationError) {
      console.error('Erro ao chamar automação:', automationError);
      // Não falha a operação principal
    }

    // Resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead capturado com sucesso!',
        lead_id: newLead.id,
        data: {
          nome: newLead.nome,
          email: newLead.email,
          telefone: newLead.telefone,
          status: newLead.status,
          created_at: newLead.created_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro geral na Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: 'Tente novamente em alguns instantes'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});