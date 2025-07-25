-- =====================================================
-- PERMITIR CONVERSAS ANÔNIMAS NO CHATBOT PÚBLICO
-- =====================================================

-- Remover policy restritiva existente
DROP POLICY IF EXISTS "conversas_ia_funcionarios_access" ON conversas_ia;

-- Nova policy: Permitir INSERT para usuários anônimos (chatbot público)
CREATE POLICY "conversas_ia_anonymous_insert" ON conversas_ia
  FOR INSERT 
  WITH CHECK (true); -- Permite qualquer inserção

-- Nova policy: Funcionários podem SELECT/UPDATE/DELETE
CREATE POLICY "conversas_ia_funcionarios_full_access" ON conversas_ia
  FOR SELECT USING (
    auth.uid() IS NULL OR -- Permite leitura anônima
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

CREATE POLICY "conversas_ia_funcionarios_modify" ON conversas_ia
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

CREATE POLICY "conversas_ia_funcionarios_delete" ON conversas_ia
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE user_id = auth.uid() 
      AND ativo = true
    )
  );

-- Comentários explicativos
COMMENT ON POLICY "conversas_ia_anonymous_insert" ON conversas_ia IS 
'Permite inserções anônimas para o chatbot público na landing page';

COMMENT ON POLICY "conversas_ia_funcionarios_full_access" ON conversas_ia IS 
'Funcionários ativos podem ver todas as conversas, incluindo anônimas';

-- Log de auditoria
INSERT INTO audit_logs (
  nome_tabela, 
  operacao, 
  id_registro, 
  dados_novos,
  usuario_id
) VALUES (
  'conversas_ia',
  'POLICY_UPDATE', 
  '20250125_allow_anonymous_chat',
  '{"action": "allow_anonymous_chat", "reason": "public_chatbot_landing_page"}',
  'system'
);