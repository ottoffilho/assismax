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

    if (req.method === 'POST') {
      console.log('🧹 Iniciando limpeza completa do sistema...')

      // 1. Listar todos os usuários
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        throw listError
      }

      console.log(`📊 Encontrados ${users.users.length} usuários para deletar`)

      let deletedCount = 0
      let errors = []

      // 2. Deletar cada usuário
      for (const user of users.users) {
        try {
          console.log(`🗑️ Deletando usuário: ${user.email}`)
          
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
          
          if (deleteError) {
            console.error(`❌ Erro ao deletar ${user.email}:`, deleteError)
            errors.push({ email: user.email, error: deleteError.message })
          } else {
            console.log(`✅ Usuário ${user.email} deletado com sucesso`)
            deletedCount++
          }
        } catch (error) {
          console.error(`❌ Erro ao deletar ${user.email}:`, error)
          errors.push({ email: user.email, error: error.message })
        }
      }

      console.log(`🎉 Limpeza concluída! ${deletedCount} usuários deletados`)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Limpeza concluída! ${deletedCount} usuários deletados`,
          totalUsers: users.users.length,
          deletedCount,
          errors: errors.length > 0 ? errors : undefined
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
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