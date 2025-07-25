-- =====================================================
-- LIMPEZA FINAL: REMOVER REFERÊNCIAS EMPRESA
-- Sistema ASSISMAX é single-tenant
-- =====================================================

-- 1. REMOVER COLUNAS EMPRESA_ID (se existirem)
-- =====================================================

-- Verificar e remover empresa_id de funcionários (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE funcionarios DROP COLUMN empresa_id CASCADE;
    RAISE NOTICE 'Coluna empresa_id removida de funcionarios';
  END IF;
END $$;

-- Verificar e remover empresa_id de leads (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' 
    AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE leads DROP COLUMN empresa_id CASCADE;
    RAISE NOTICE 'Coluna empresa_id removida de leads';
  END IF;
END $$;

-- Verificar e remover empresa_id de produtos (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' 
    AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE produtos DROP COLUMN empresa_id CASCADE;
    RAISE NOTICE 'Coluna empresa_id removida de produtos';
  END IF;
END $$;

-- 2. REMOVER TABELA EMPRESAS (se existir)
-- =====================================================

-- Remover tabela empresas completamente
DROP TABLE IF EXISTS empresas CASCADE;

-- 3. REMOVER ÍNDICES RELACIONADOS (se existirem)
-- =====================================================

-- Remover índices relacionados a empresa_id
DROP INDEX IF EXISTS idx_funcionarios_empresa_id;
DROP INDEX IF EXISTS idx_funcionarios_empresa_ativo;
DROP INDEX IF EXISTS idx_leads_empresa_id;
DROP INDEX IF EXISTS idx_produtos_empresa_id;

-- 4. COMENTÁRIOS EXPLICATIVOS
-- =====================================================

-- Sistema ASSISMAX - Single-tenant atacarejo Valparaíso de Goiás
-- (comentário de database não suportado nesta versão)

-- 5. LOG DE AUDITORIA
-- =====================================================

INSERT INTO audit_logs (
  nome_tabela, 
  operacao, 
  id_registro, 
  dados_novos,
  usuario_id
) VALUES (
  'system_migrations',
  'SCHEMA_CLEANUP', 
  gen_random_uuid(),
  '{"action": "removed_empresa_references", "reason": "single_tenant_assismax", "removed": ["empresas_table", "empresa_id_columns", "empresa_indexes"]}',
  'system'
);

-- =====================================================
-- CONFIRMAÇÃO FINAL
-- =====================================================

SELECT 
  'ASSISMAX SINGLE-TENANT CLEANUP CONCLUÍDO' as status,
  NOW() as timestamp,
  'Sistema simplificado para single-tenant' as descricao;