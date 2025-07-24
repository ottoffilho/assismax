import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin Client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (req.method === 'GET') {
      // Check if setup is completed by verifying if there are active funcionarios
      const { data: funcionarios, error: funcionariosError } = await supabaseAdmin
        .from('funcionarios')
        .select('id')
        .eq('ativo', true)
        .eq('nivel_acesso', 'admin')
        .limit(1)

      if (funcionariosError) {
        throw funcionariosError
      }

      // Setup é considerado concluído se há pelo menos um admin ativo
      const setupCompleted = funcionarios && funcionarios.length > 0

      return new Response(
        JSON.stringify({ 
          setupCompleted,
          message: setupCompleted ? 'Setup já foi concluído' : 'Setup não foi concluído' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (req.method === 'POST') {
      // Perform initial setup
      const body = await req.json()
      const { adminData } = body // Removido empresaData - não é mais necessário

      console.log('Dados recebidos:', { 
        admin: adminData ? { nome: adminData.nome, email: adminData.email } : null 
      })

      if (!adminData) {
        return new Response(
          JSON.stringify({ error: 'Dados do administrador são obrigatórios' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Validações básicas
      if (!adminData.email || !adminData.senha || !adminData.nome) {
        return new Response(
          JSON.stringify({ error: 'Email, senha e nome do admin são obrigatórios' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      // Start transaction-like operations
      let authData = null
      try {
        // 1. Create admin user in Auth
        console.log('Criando usuário no Auth...', { email: adminData.email })
        const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: adminData.email,
          password: adminData.senha,
          email_confirm: true,
          user_metadata: {
            nome: adminData.nome
          }
        })

        if (authError) {
          console.error('Erro ao criar usuário no Auth:', authError)
          throw authError
        }
        authData = authResult
        console.log('Usuário criado no Auth:', authData.user?.id)

        // 2. Check if funcionario already exists
        const { data: existingFuncionario } = await supabaseAdmin
          .from('funcionarios')
          .select('id, ativo')
          .eq('email', adminData.email)
          .single()

        if (existingFuncionario) {
          console.log('Funcionário já existe, atualizando...')
          const { error: updateError } = await supabaseAdmin
            .from('funcionarios')
            .update({
              nome: adminData.nome,
              telefone: adminData.telefone || '',
              nivel_acesso: 'admin',
              user_id: authData.user.id, // IMPORTANTE: Vincular user_id
              ativo: true
            })
            .eq('email', adminData.email)

          if (updateError) {
            console.error('Erro ao atualizar funcionário:', updateError)
            throw updateError
          }
          console.log('Funcionário atualizado com sucesso')
        } else {
          // Create new admin record in funcionarios table
          console.log('Criando funcionário...', {
            nome: adminData.nome,
            email: adminData.email,
            user_id: authData.user.id
          })
          const { error: funcionarioError } = await supabaseAdmin
            .from('funcionarios')
            .insert({
              nome: adminData.nome,
              email: adminData.email,
              telefone: adminData.telefone || '',
              nivel_acesso: 'admin',
              user_id: authData.user.id, // IMPORTANTE: Vincular user_id
              ativo: true
            })

          if (funcionarioError) {
            console.error('Erro ao criar funcionário:', funcionarioError)
            throw funcionarioError
          }
          console.log('Funcionário criado com sucesso')
        }

        // 3. Deactivate test users (se existirem)
        await supabaseAdmin
          .from('funcionarios')
          .update({ ativo: false })
          .in('email', ['admin@assismax.com.br', 'funcionario@assismax.com.br'])
          .neq('email', adminData.email) // Não desativar o admin que acabamos de criar

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Setup inicial concluído com sucesso',
            adminUserId: authData.user?.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      } catch (setupError) {
        console.error('Erro durante setup:', setupError)

        // If user creation failed, try to clean up
        if (authData?.user?.id) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            console.log('Usuário de rollback removido:', authData.user.id)
          } catch (deleteError) {
            console.error('Erro ao remover usuário de rollback:', deleteError)
          }
        }

        throw setupError
      }
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/initial-setup' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/