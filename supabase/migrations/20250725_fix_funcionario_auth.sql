-- Fix Authentication Issues - Funcionário RPC (CORRIGIDO)
-- ===============================================

-- 1. Criar função para verificar/criar funcionário automaticamente
CREATE OR REPLACE FUNCTION verify_user_login(email_param TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  nome TEXT,
  email TEXT,
  nivel_acesso TEXT,
  ativo BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_funcionario RECORD;
  v_auth_user RECORD;
BEGIN
  -- Buscar funcionário existente
  SELECT f.id, f.user_id, f.nome, f.email, f.nivel_acesso, f.ativo
  INTO v_funcionario
  FROM funcionarios f
  WHERE f.email = email_param AND f.ativo = true;

  -- Se funcionário encontrado, retornar dados
  IF FOUND THEN
    RETURN QUERY SELECT
      v_funcionario.id,
      v_funcionario.user_id,
      v_funcionario.nome,
      v_funcionario.email,
      v_funcionario.nivel_acesso,
      v_funcionario.ativo;
    RETURN;
  END IF;

  -- Se não encontrado, verificar se existe no auth.users
  SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', au.email) as nome
  INTO v_auth_user
  FROM auth.users au
  WHERE au.email = email_param;

  -- Se existe no auth mas não em funcionarios, criar automaticamente
  IF FOUND THEN
    INSERT INTO funcionarios (
      user_id,
      nome,
      email,
      nivel_acesso,
      ativo
      -- REMOVIDO: empresa_id (não existe mais na tabela)
    ) VALUES (
      v_auth_user.id,
      v_auth_user.nome,
      email_param,
      'funcionario', -- Nível padrão
      true
    )
    RETURNING funcionarios.id, funcionarios.user_id, funcionarios.nome,
              funcionarios.email, funcionarios.nivel_acesso, funcionarios.ativo
    INTO v_funcionario;

    -- Log da criação automática (se tabela audit_logs existir)
    BEGIN
      INSERT INTO audit_logs (
        nome_tabela,
        operacao,
        id_registro,
        dados_novos,
        usuario_id
      ) VALUES (
        'funcionarios',
        'AUTO_CREATE',
        v_funcionario.id::TEXT,
        jsonb_build_object(
          'email', email_param,
          'nome', v_auth_user.nome,
          'nivel_acesso', 'funcionario',
          'reason', 'auto_created_from_auth'
        ),
        v_auth_user.id::TEXT
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar erro de audit_logs se tabela não existir
        NULL;
    END;

    RETURN QUERY SELECT
      v_funcionario.id,
      v_funcionario.user_id,
      v_funcionario.nome,
      v_funcionario.email,
      v_funcionario.nivel_acesso,
      v_funcionario.ativo;
    RETURN;
  END IF;

  -- Se não existe nem no auth.users, retornar vazio
  RETURN;
END;
$$;

-- 2. Comentários
COMMENT ON FUNCTION verify_user_login(TEXT) IS 
'Verifica login do usuário e cria registro em funcionarios automaticamente se necessário';

-- 3. Permissões (função é SECURITY DEFINER para bypass RLS)
-- Não precisa de GRANT pois é SECURITY DEFINER com definer sendo superuser

-- 4. Log da migração
INSERT INTO audit_logs (
  nome_tabela,
  operacao,
  id_registro,
  dados_novos,
  usuario_id
) VALUES (
  'system_migrations',
  'CREATE_FUNCTION',
  '20250725_fix_funcionario_auth',
  '{"function": "verify_user_login", "purpose": "auto_create_funcionario_from_auth"}',
  'system'
);