import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsydniuoipecgsocsuim.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeWRuaXVvaXBlY2dzb2NzdWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDAxNzgsImV4cCI6MjA2ODYxNjE3OH0.DWMdClD8WzXL-B67HRIOfVVmz39H81gbIKzpMBnPTAk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no Supabase...');
    
    // Tentar buscar dados da tabela leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5);
    
    if (leadsError) {
      console.log('❌ Erro ao acessar tabela leads:', leadsError.message);
    } else {
      console.log('✅ Tabela leads encontrada!');
      console.log('📊 Dados encontrados:', leadsData?.length || 0, 'registros');
      if (leadsData && leadsData.length > 0) {
        console.log('📋 Primeiro registro:', leadsData[0]);
      }
    }
    
    // Verificar outras tabelas
    const tables = ['chatbot_users', 'conversations', 'query_logs', 'sessions'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: OK`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTables();