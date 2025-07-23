-- Configuração de Autenticação e Usuários Iniciais
-- =================================================

-- Habilitar extensão para criptografia (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para criar usuário no Auth e na tabela funcionarios
CREATE OR REPLACE FUNCTION create_funcionario_with_auth(
  p_email VARCHAR,
  p_senha VARCHAR,
  p_nome VARCHAR,
  p_nivel_acesso VARCHAR DEFAULT 'funcionario',
  p_telefone VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_empresa_id UUID;
  v_funcionario_id UUID;
BEGIN
  -- Buscar a empresa ativa (ASSISMAX)
  SELECT id INTO v_empresa_id 
  FROM empresas 
  WHERE ativo = true 
  LIMIT 1;
  
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa ativa encontrada';
  END IF;
  
  -- Inserir funcionário
  INSERT INTO funcionarios (
    nome, 
    email, 
    telefone, 
    nivel_acesso, 
    empresa_id, 
    ativo
  ) VALUES (
    p_nome,
    p_email,
    p_telefone,
    p_nivel_acesso,
    v_empresa_id,
    true
  ) RETURNING id INTO v_funcionario_id;
  
  RETURN v_funcionario_id;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a empresa ASSISMAX existe, senão criar
DO $$
DECLARE
  v_empresa_id UUID;
BEGIN
  -- Verificar se empresa existe
  SELECT id INTO v_empresa_id FROM empresas WHERE slug = 'assismax' LIMIT 1;
  
  IF v_empresa_id IS NULL THEN
    -- Criar empresa ASSISMAX
    INSERT INTO empresas (
      nome,
      slug,
      telefone,
      email,
      endereco,
      configuracoes,
      plano,
      ativo
    ) VALUES (
      'ASSISMAX Atacarejo',
      'assismax',
      '(61) 3333-4444',
      'contato@assismax.com.br',
      'Av. Principal, 1000 - Valparaíso de Goiás - GO',
      '{"horario_funcionamento": "Segunda a Sábado: 8h às 20h, Domingo: 8h às 14h"}',
      'basico',
      true
    );
  END IF;
END $$;

-- Criar usuários de teste (REMOVER EM PRODUÇÃO)
-- Nota: Em produção, use o Supabase Dashboard ou API para criar usuários com senhas seguras
DO $$
DECLARE
  v_admin_exists BOOLEAN;
  v_func_exists BOOLEAN;
BEGIN
  -- Verificar se admin já existe
  SELECT EXISTS(SELECT 1 FROM funcionarios WHERE email = 'admin@assismax.com.br') INTO v_admin_exists;
  
  IF NOT v_admin_exists THEN
    -- Criar admin
    PERFORM create_funcionario_with_auth(
      'admin@assismax.com.br',
      'admin123', -- MUDAR EM PRODUÇÃO
      'Administrador ASSISMAX',
      'admin',
      '(61) 99999-9999'
    );
  END IF;
  
  -- Verificar se funcionário teste já existe
  SELECT EXISTS(SELECT 1 FROM funcionarios WHERE email = 'funcionario@assismax.com.br') INTO v_func_exists;
  
  IF NOT v_func_exists THEN
    -- Criar funcionário teste
    PERFORM create_funcionario_with_auth(
      'funcionario@assismax.com.br',
      'func123', -- MUDAR EM PRODUÇÃO
      'João Silva',
      'funcionario',
      '(61) 98888-8888'
    );
  END IF;
END $$;

-- Atualizar políticas RLS para funcionários
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- Política para funcionários verem apenas dados da própria empresa
CREATE POLICY "Funcionarios veem apenas sua empresa" ON funcionarios
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Política para admin gerenciar funcionários da empresa
CREATE POLICY "Admin gerencia funcionarios" ON funcionarios
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND nivel_acesso = 'admin'
    )
  );

-- Atualizar políticas de leads para usar email do JWT
DROP POLICY IF EXISTS "Funcionarios veem apenas seus leads" ON leads;
DROP POLICY IF EXISTS "Admins veem tudo da empresa" ON leads;

-- Nova política para funcionários
CREATE POLICY "Funcionarios veem apenas seus leads" ON leads
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
    AND (
      funcionario_id IN (
        SELECT id FROM funcionarios 
        WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
      OR funcionario_id IS NULL
    )
  );

-- Nova política para admins
CREATE POLICY "Admins veem todos leads da empresa" ON leads
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND nivel_acesso = 'admin'
    )
  );

-- Função para registrar login (audit trail)
CREATE OR REPLACE FUNCTION log_user_login() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    tabela,
    operacao,
    registro_id,
    usuario_id,
    dados_novos,
    ip_address,
    user_agent
  ) VALUES (
    'auth.users',
    'LOGIN',
    NEW.id,
    NEW.id,
    jsonb_build_object(
      'email', NEW.email,
      'last_sign_in_at', NEW.last_sign_in_at
    ),
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para log de login (se possível no seu plano Supabase)
-- Nota: Alguns planos Supabase não permitem triggers em auth.users
-- CREATE TRIGGER on_auth_user_login 
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW
--   WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
--   EXECUTE FUNCTION log_user_login();

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_funcionarios_email ON funcionarios(email);
CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa_ativo ON funcionarios(empresa_id, ativo);
CREATE INDEX IF NOT EXISTS idx_leads_funcionario ON leads(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_leads_empresa_status ON leads(empresa_id, status);

-- Comentários importantes
COMMENT ON FUNCTION create_funcionario_with_auth IS 'Cria funcionário com autenticação. USE APENAS PARA TESTES - Em produção, use Supabase Dashboard';
COMMENT ON TABLE funcionarios IS 'Tabela de funcionários com níveis de acesso: admin e funcionario';
COMMENT ON COLUMN funcionarios.nivel_acesso IS 'Níveis: admin (acesso total) ou funcionario (acesso restrito aos próprios leads)';

-- IMPORTANTE: Em produção, remover usuários de teste e usar senhas seguras
-- Para criar usuários em produção, use o Supabase Dashboard:
-- 1. Vá para Authentication > Users
-- 2. Clique em "Invite user" 
-- 3. Depois crie o registro correspondente na tabela funcionarios