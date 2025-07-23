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
    // Create Supabase admin client (bypasses RLS)
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

    // Create regular client for auth verification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? ''
          }
        }
      }
    )

    const { nome, email, telefone, nivel_acesso, senha } = await req.json()

    console.log('Iniciando criação de funcionário:', { email, nivel_acesso })

    // 1. Verificar se o usuário atual é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('Usuário autenticado:', user.id)

    // 2. Verificar se o usuário atual é admin usando user_id
    const { data: adminUser, error: adminError } = await supabase
      .from('funcionarios')
      .select('nivel_acesso, empresa_id')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .single()

    if (adminError || !adminUser || adminUser.nivel_acesso !== 'admin') {
      throw new Error('Apenas administradores podem criar funcionários')
    }

    console.log('Admin verificado:', adminUser)

    // 3. Verificar se funcionário já existe
    const { data: existingFuncionario } = await supabaseAdmin
      .from('funcionarios')
      .select('id')
      .eq('email', email)
      .single()

    if (existingFuncionario) {
      throw new Error('Funcionário com este email já existe')
    }

    // 4. Criar usuário no Auth usando admin client
    console.log('Criando usuário no Auth...')
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        nivel_acesso
      }
    })

    if (createAuthError) {
      console.error('Erro ao criar usuário no Auth:', createAuthError)
      throw createAuthError
    }

    console.log('Usuário criado no Auth:', authData.user.id)

    // 5. Criar funcionário na tabela usando admin client
    console.log('Criando funcionário na tabela...')
    const { data: funcionario, error: funcionarioError } = await supabaseAdmin
      .from('funcionarios')
      .insert({
        nome,
        email,
        telefone: telefone || null,
        nivel_acesso,
        empresa_id: adminUser.empresa_id,
        user_id: authData.user.id,
        ativo: true
      })
      .select()
      .single()

    if (funcionarioError) {
      console.error('Erro ao criar funcionário:', funcionarioError)
      
      // Limpar usuário do Auth se funcionário falhou
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.log('Usuário removido do Auth após falha')
      } catch (cleanupError) {
        console.error('Erro ao limpar usuário do Auth:', cleanupError)
      }
      
      throw funcionarioError
    }

    console.log('Funcionário criado com sucesso:', funcionario.id)

    return new Response(
      JSON.stringify({
        success: true,
        funcionario,
        message: 'Funcionário criado com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})