-- =====================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO
-- Remove empresas e adiciona user_id
-- =====================================================

-- 1. BACKUP: Salvar dados importantes antes de começar
-- =====================================================
CREATE TABLE IF NOT EXISTS _backup_funcionarios AS 
SELECT * FROM funcionarios;

CREATE TABLE IF NOT EXISTS _backup_leads AS 
SELECT * FROM leads;

-- 2. REMOVER POLÍTICAS RLS ANTIGAS
-- =====================================================
DROP POLICY IF EXISTS "funcionarios_propria_empresa" ON funcionarios;
DROP POLICY IF EXISTS "funcionarios_seus_leads" ON leads;
DROP POLICY IF EXISTS "conversas_empresa" ON conversas;
DROP POLICY IF EXISTS "conversas_ia_empresa" ON conversas_ia;
DROP POLICY IF EXISTS "consentimentos_empresa" ON consentimentos;
DROP POLICY IF EXISTS "Funcionarios veem apenas sua empresa" ON funcionarios;
DROP POLICY IF EXISTS "Admin gerencia funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Funcionarios veem apenas seus leads" ON leads;
DROP POLICY IF EXISTS "Admins veem todos leads da empresa" ON leads;

-- 3. ADICIONAR user_id NA TABELA funcionarios
-- =====================================================
ALTER TABLE funcionarios 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_funcionarios_user_id ON funcionarios(user_id);

-- 4. REMOVER DEPENDÊNCIAS DE empresa_id
-- =====================================================
-- Remover foreign keys
ALTER TABLE funcionarios DROP CONSTRAINT IF EXISTS funcionarios_empresa_id_fkey;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_empresa_id_fkey;
ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_empresa_id_fkey;
ALTER TABLE metricas DROP CONSTRAINT IF EXISTS metricas_empresa_id_fkey;

-- Remover colunas empresa_id (mantendo dados temporariamente)
ALTER TABLE funcionarios DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE leads DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE produtos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE metricas DROP COLUMN IF EXISTS empresa_id;

-- 5. CRIAR NOVAS POLÍTICAS RLS SIMPLIFICADAS
-- =====================================================

-- Políticas para funcionarios
CREATE POLICY "admin_ve_todos_funcionarios" ON funcionarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
      AND f.ativo = true
    )
  );

CREATE POLICY "admin_gerencia_funcionarios" ON funcionarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
      AND f.ativo = true
    )
  );

CREATE POLICY "funcionario_ve_proprio_registro" ON funcionarios
  FOR SELECT USING (user_id = auth.uid());

-- Políticas para leads
CREATE POLICY "admin_ve_todos_leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
      AND f.ativo = true
    )
  );

CREATE POLICY "funcionario_ve_seus_leads" ON leads
  FOR ALL USING (
    funcionario_id IN (
      SELECT id FROM funcionarios 
      WHERE user_id = auth.uid()
      AND ativo = true
    )
    OR funcionario_id IS NULL
  );

-- Políticas para conversas
CREATE POLICY "funcionario_ve_conversas_seus_leads" ON conversas
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE funcionario_id IN (
        SELECT id FROM funcionarios 
        WHERE user_id = auth.uid()
      )
      OR funcionario_id IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
    )
  );

-- Políticas para conversas_ia
CREATE POLICY "funcionario_ve_conversas_ia_seus_leads" ON conversas_ia
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE funcionario_id IN (
        SELECT id FROM funcionarios 
        WHERE user_id = auth.uid()
      )
      OR funcionario_id IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
    )
  );

-- Políticas para consentimentos
CREATE POLICY "funcionario_ve_consentimentos_seus_leads" ON consentimentos
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE funcionario_id IN (
        SELECT id FROM funcionarios 
        WHERE user_id = auth.uid()
      )
      OR funcionario_id IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
    )
  );

-- Políticas para produtos (todos podem ver)
CREATE POLICY "todos_veem_produtos" ON produtos
  FOR SELECT USING (true);

CREATE POLICY "admin_gerencia_produtos" ON produtos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
    )
  );

-- Políticas para metricas
CREATE POLICY "admin_ve_metricas" ON metricas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
    )
  );

-- Políticas para audit_logs (apenas admin)
CREATE POLICY "admin_ve_audit_logs" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios f
      WHERE f.user_id = auth.uid() 
      AND f.nivel_acesso = 'admin'
    )
  );

-- 6. REMOVER TABELA empresas
-- =====================================================
DROP TABLE IF EXISTS empresas CASCADE;

-- 7. ATUALIZAR VIEWS
-- =====================================================
DROP VIEW IF EXISTS dashboard_proprietario;
DROP VIEW IF EXISTS performance_funcionarios;

-- Criar nova view simplificada
CREATE OR REPLACE VIEW dashboard_metricas AS
SELECT 
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'novo' THEN 1 END) as leads_novos,
  COUNT(CASE WHEN l.status = 'em_atendimento' THEN 1 END) as leads_em_atendimento,
  COUNT(CASE WHEN l.status = 'convertido' THEN 1 END) as leads_convertidos,
  COUNT(CASE WHEN l.created_at >= CURRENT_DATE THEN 1 END) as leads_hoje,
  COUNT(CASE WHEN l.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_semana,
  COUNT(CASE WHEN l.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as leads_mes
FROM leads l;

CREATE OR REPLACE VIEW performance_funcionarios AS
SELECT 
  f.id,
  f.nome as funcionario,
  f.nivel_acesso,
  COUNT(l.id) as leads_atribuidos,
  COUNT(CASE WHEN l.status = 'convertido' THEN 1 END) as leads_convertidos,
  CASE 
    WHEN COUNT(l.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN l.status = 'convertido' THEN 1 END)::decimal / COUNT(l.id)::decimal) * 100, 2)
    ELSE 0 
  END as taxa_conversao
FROM funcionarios f
LEFT JOIN leads l ON f.id = l.funcionario_id
WHERE f.ativo = true
GROUP BY f.id, f.nome, f.nivel_acesso;

-- 8. FUNÇÃO AUXILIAR PARA BUSCAR FUNCIONÁRIO POR AUTH USER
-- =====================================================
CREATE OR REPLACE FUNCTION get_funcionario_by_auth_user()
RETURNS funcionarios AS $$
DECLARE
  v_funcionario funcionarios;
BEGIN
  SELECT * INTO v_funcionario
  FROM funcionarios
  WHERE user_id = auth.uid()
  AND ativo = true
  LIMIT 1;
  
  RETURN v_funcionario;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. LIMPEZA COMPLETA DE DADOS PARA TESTES
-- =====================================================
-- ATENÇÃO: Isso deletará TODOS os dados!

-- Desabilitar triggers temporariamente
ALTER TABLE leads DISABLE TRIGGER ALL;
ALTER TABLE funcionarios DISABLE TRIGGER ALL;
ALTER TABLE conversas DISABLE TRIGGER ALL;
ALTER TABLE conversas_ia DISABLE TRIGGER ALL;

-- Deletar dados em ordem para respeitar foreign keys
DELETE FROM conversas;
DELETE FROM conversas_ia;
DELETE FROM consentimentos;
DELETE FROM leads;
DELETE FROM produtos;
DELETE FROM metricas;
DELETE FROM audit_logs;
DELETE FROM funcionarios;

-- Reabilitar triggers
ALTER TABLE leads ENABLE TRIGGER ALL;
ALTER TABLE funcionarios ENABLE TRIGGER ALL;
ALTER TABLE conversas ENABLE TRIGGER ALL;
ALTER TABLE conversas_ia ENABLE TRIGGER ALL;

-- Deletar usuários do auth (CUIDADO!)
-- Isso é feito via Edge Function para segurança

-- 10. COMENTÁRIOS FINAIS
-- =====================================================
COMMENT ON TABLE funcionarios IS 'Tabela de funcionários do sistema ASSISMAX - Sistema dedicado sem multi-tenant';
COMMENT ON COLUMN funcionarios.user_id IS 'ID do usuário no auth.users - vínculo principal de autenticação';
COMMENT ON COLUMN funcionarios.nivel_acesso IS 'admin = acesso total, funcionario = acesso aos próprios leads';

-- Fim da migration!