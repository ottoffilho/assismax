import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AutomationRequest {
  lead_id: string;
  lead_data: any;
  consents: {
    aceite_marketing: boolean;
    aceite_whatsapp: boolean;
  };
}

interface N8NLeadPayload {
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  data: string;
}

interface EmailService {
  to: string;
  subject: string;
  html: string;
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

    const requestBody = await req.json();

    // Verificar se é um proxy para N8N
    if (requestBody.action === 'send_to_n8n') {
      try {
        const { webhook_url, payload }: { webhook_url: string, payload: N8NLeadPayload } = requestBody;
        
        console.log('🔄 Proxy para N8N:', webhook_url);
        console.log('📋 Dados do lead:', payload);
        
        // 1. Primeiro salvar no Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: leadCreated, error: leadError } = await supabase
          .from('leads')
          .insert({
            empresa_id: '231f795a-b14c-438b-a896-2f2e479cfa02', // ID da ASSISMAX
            nome: payload.nome,
            telefone: payload.telefone,
            email: payload.email,
            origem: payload.origem || 'landing_page',
            status: 'novo',
            observacoes: 'Lead capturado via formulário'
          })
          .select()
          .single();

        if (leadError) {
          console.error('❌ Erro ao salvar lead no Supabase:', leadError);
          throw new Error(`Erro Supabase: ${leadError.message}`);
        }

        console.log('✅ Lead salvo no Supabase:', leadCreated.id);

        // 2. Enviar para N8N
        const response = await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log('✅ Dados enviados para N8N via proxy');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Lead salvo e enviado para N8N',
              lead_id: leadCreated.id 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error(`N8N retornou status ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Erro no proxy para N8N:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao processar lead', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Lógica original para automação de leads
    const { lead_id, lead_data, consents }: AutomationRequest = requestBody;

    if (!lead_id || !lead_data) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Iniciando automação para lead ${lead_id}`);

    // 1. ENVIAR EMAIL PARA PROPRIETÁRIO
    try {
      await sendOwnerNotification(lead_data);
      console.log('Email para proprietário enviado');
    } catch (error) {
      console.error('Erro ao enviar email para proprietário:', error);
    }

    // 2. ATUALIZAR GOOGLE SHEETS
    try {
      await updateGoogleSheets(lead_data);
      console.log('Google Sheets atualizado');
    } catch (error) {
      console.error('Erro ao atualizar Google Sheets:', error);
    }

    // 3. ENVIAR WHATSAPP (se autorizado)
    if (consents.aceite_whatsapp) {
      try {
        await sendWelcomeWhatsApp(lead_data);
        console.log('WhatsApp de boas-vindas enviado');
      } catch (error) {
        console.error('Erro ao enviar WhatsApp:', error);
      }
    }

    // 4. REGISTRAR AUDIT LOG
    try {
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          nome_tabela: 'leads',
          operacao: 'INSERT',
          id_registro: lead_id,
          usuario_id: null, // Sistema automático
          dados_novos: lead_data,
          ip_address: null,
          user_agent: 'system-automation'
        });

      if (auditError) {
        console.error('Erro no audit log:', auditError);
      }
    } catch (auditError) {
      console.error('Erro ao registrar audit:', auditError);
    }

    // 5. AGENDAR FOLLOW-UP (para implementação futura)
    try {
      await scheduleFollowUp(lead_id, lead_data);
    } catch (error) {
      console.error('Erro ao agendar follow-up:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automação executada com sucesso',
        executed_steps: [
          'email_proprietario',
          'google_sheets',
          consents.aceite_whatsapp ? 'whatsapp_welcome' : 'whatsapp_skipped',
          'audit_log'
        ]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro geral na automação:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro na automação',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// FUNÇÃO: Enviar email para proprietário
async function sendOwnerNotification(leadData: any) {
  const ownerEmail = Deno.env.get('OWNER_EMAIL') || 'proprietario@assismax.com';
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎉 Novo Lead Capturado!</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Dados do Lead:</h3>
        <p><strong>Nome:</strong> ${leadData.nome}</p>
        <p><strong>Telefone:</strong> ${leadData.telefone}</p>
        <p><strong>Email:</strong> ${leadData.email}</p>
        <p><strong>Origem:</strong> Landing Page</p>
        <p><strong>Data:</strong> ${new Date(leadData.created_at).toLocaleString('pt-BR')}</p>
        ${leadData.observacoes ? `<p><strong>Observações:</strong> ${leadData.observacoes}</p>` : ''}
      </div>
      <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
        <p style="margin: 0; color: #166534;">
          <strong>Próximo passo:</strong> Entre em contato com o lead nas próximas 2 horas para maximizar a conversão!
        </p>
      </div>
    </div>
  `;

  // Simulação de envio de email (implementar com serviço real)
  console.log('EMAIL SIMULADO para:', ownerEmail);
  console.log('Conteúdo:', emailHtml);
  
  // TODO: Implementar com Resend, SendGrid ou outro serviço
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'sistema@assismax.com',
  //     to: ownerEmail,
  //     subject: `🎉 Novo Lead: ${leadData.nome}`,
  //     html: emailHtml
  //   }),
  // });
}

// FUNÇÃO: Atualizar Google Sheets
async function updateGoogleSheets(leadData: any) {
  const sheetsApiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
  const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID');
  
  if (!sheetsApiKey || !spreadsheetId) {
    console.log('Google Sheets não configurado');
    return;
  }

  const values = [[
    leadData.nome,
    leadData.telefone,
    leadData.email,
    leadData.origem,
    leadData.status,
    new Date(leadData.created_at).toLocaleString('pt-BR'),
    leadData.observacoes || ''
  ]];

  // Simulação de atualização do Google Sheets
  console.log('GOOGLE SHEETS SIMULADO');
  console.log('Dados a inserir:', values);
  
  // TODO: Implementar com Google Sheets API
  // const response = await fetch(
  //   `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Leads!A:G:append?valueInputOption=RAW&key=${sheetsApiKey}`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       values: values
  //     }),
  //   }
  // );
}

// FUNÇÃO: Enviar WhatsApp de boas-vindas
async function sendWelcomeWhatsApp(leadData: any) {
  const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!whatsappToken || !phoneNumberId) {
    console.log('WhatsApp não configurado');
    return;
  }

  const message = `
Olá ${leadData.nome}! 👋

Obrigado por se cadastrar no ASSISMAX! 

Somos especialistas em atacarejo e temos os melhores preços de Valparaíso de Goiás em:
🌾 Arroz, Feijão, Óleo
☕ Café, Leite
🥤 Bebidas

Nossa equipe entrará em contato em breve para apresentar nossas ofertas exclusivas!

*ASSISMAX - Atacarejo que cabe no seu bolso* 💰
  `.trim();

  // Simulação de envio WhatsApp
  console.log('WHATSAPP SIMULADO para:', leadData.telefone);
  console.log('Mensagem:', message);
  
  // TODO: Implementar com WhatsApp Business API
  // const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${whatsappToken}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: leadData.telefone,
  //     text: { body: message }
  //   }),
  // });
}

// FUNÇÃO: Agendar follow-up
async function scheduleFollowUp(leadId: string, leadData: any) {
  // Para implementação futura - sistema de follow-up automático
  console.log(`Follow-up agendado para lead ${leadId} em 24h`);
  
  // TODO: Implementar com sistema de filas/agendamento
  // - Agendar email de follow-up em 24h se não houver contato
  // - Agendar SMS de lembrete em 48h
  // - Agendar remoção automática após 30 dias se não convertido
}