-- =====================================================
-- SIMPLIFICAÇÃO RLS PARA SINGLE-TENANT ASSISMAX
-- Remove complexidade desnecessária de multi-tenant
-- =====================================================

-- 1. REMOVER POLICIES COMPLEXAS EXISTENTES
-- =====================================================

-- Remover policies que referenciam empresa_id (desnecessário para single-tenant)
DROP POLICY IF EXISTS "funcionarios_propria_empresa" ON funcionarios;
DROP POLICY IF EXISTS "funcionarios_seus_leads" ON leads;
DROP POLICY IF EXISTS "conversas_empresa" ON conversas;
DROP POLICY IF EXISTS "conversas_ia_empresa" ON conversas_ia;
DROP POLICY IF EXISTS "consentimentos_empresa" ON consentimentos;

-- 2. POLICIES SIMPLIFICADAS PARA SINGLE-TENANT
-- =====================================================

-- FUNCIONÁRIOS: Acesso baseado em user_id do Supabase Auth
CREATE POLICY "funcionarios_own_data" ON funcionarios
  FOR ALL USING (user_id = auth.uid());

-- FUNCIONÁRIOS: Admins podem ver todos, funcionários apenas seus dados
CREATE POLICY "funcionarios_admin_view" ON funcionarios
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND nivel_acesso = 'admin'
      AND ativo = true
    )
  );

-- FUNCIONÁRIOS: Apenas admins podem inserir/atualizar outros funcionários
CREATE POLICY "funcionarios_admin_modify" ON funcionarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND nivel_acesso = 'admin'
      AND ativo = true
    )
  );

CREATE POLICY "funcionarios_admin_update" ON funcionarios
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND nivel_acesso = 'admin'
      AND ativo = true
    )
  );

-- LEADS: Todos os funcionários ativos podem acessar todos os leads (single-tenant)
CREATE POLICY "leads_funcionarios_access" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- CONVERSAS: Funcionários ativos podem acessar todas as conversas
CREATE POLICY "conversas_funcionarios_access" ON conversas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- CONVERSAS IA: Funcionários ativos podem acessar todas as conversas IA
CREATE POLICY "conversas_ia_funcionarios_access" ON conversas_ia
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- CONSENTIMENTOS: Funcionários ativos podem acessar todos os consentimentos
CREATE POLICY "consentimentos_funcionarios_access" ON consentimentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- PRODUTOS: Funcionários ativos podem acessar todos os produtos
CREATE POLICY "produtos_funcionarios_access" ON produtos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- MÉTRICAS: Funcionários ativos podem acessar todas as métricas
CREATE POLICY "metricas_funcionarios_access" ON metricas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- 3. COMENTÁRIOS EXPLICATIVOS
-- =====================================================

COMMENT ON POLICY "funcionarios_own_data" ON funcionarios IS 
'Funcionários podem ver e editar apenas seus próprios dados usando user_id';

COMMENT ON POLICY "funcionarios_admin_view" ON funcionarios IS 
'Admins podem ver todos os funcionários, funcionários normais apenas seus dados';

COMMENT ON POLICY "leads_funcionarios_access" ON leads IS 
'Single-tenant: todos os funcionários ativos podem acessar todos os leads';

COMMENT ON POLICY "conversas_funcionarios_access" ON conversas IS 
'Single-tenant: funcionários ativos podem acessar todas as conversas';

-- 4. LOGS DE AUDITORIA
-- =====================================================

INSERT INTO audit_logs (
  nome_tabela, 
  operacao, 
  id_registro, 
  dados_novos,
  usuario_id
) VALUES (
  'system_migrations',
  'RLS_SIMPLIFICATION', 
  '20250725_simplify_rls_single_tenant',
  '{"action": "simplified_rls_policies", "reason": "single_tenant_approach", "tables_affected": ["funcionarios", "leads", "conversas", "conversas_ia", "consentimentos", "produtos", "metricas"]}',
  'system'
);