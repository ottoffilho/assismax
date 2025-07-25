import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Ler variáveis do arquivo .env
const envContent = readFileSync('.env', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEmpresas() {
  console.log('🔍 Verificando empresas cadastradas...')
  
  try {
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('*')
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error.message)
      return
    }
    
    if (empresas && empresas.length > 0) {
      console.log('✅ Empresas encontradas:')
      empresas.forEach((empresa, index) => {
        console.log(`${index + 1}. ID: ${empresa.id}`)
        console.log(`   Nome: ${empresa.nome}`)
        console.log(`   Slug: ${empresa.slug}`)
        console.log(`   Ativo: ${empresa.ativo}`)
        console.log('---')
      })
    } else {
      console.log('⚠️ Nenhuma empresa encontrada na tabela empresas')
      console.log('💡 Vou criar uma empresa padrão...')
      
      // Criar empresa padrão
      const { data: novaEmpresa, error: errorCreate } = await supabase
        .from('empresas')
        .insert([
          {
            nome: 'AssisMax Atacarejo',
            slug: 'assismax-atacarejo',
            telefone: '(11) 99999-9999',
            email: 'contato@assismax.com.br',
            endereco: 'São Paulo, SP',
            plano: 'basico',
            ativo: true
          }
        ])
        .select()
      
      if (errorCreate) {
        console.error('❌ Erro ao criar empresa:', errorCreate.message)
      } else {
        console.log('✅ Empresa padrão criada com sucesso!')
        console.log('ID da empresa:', novaEmpresa[0].id)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

checkEmpresas()