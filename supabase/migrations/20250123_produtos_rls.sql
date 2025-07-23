-- Políticas RLS para tabela produtos
-- Permite que admins da empresa gerenciem produtos

-- Política para leitura (todos podem ver produtos ativos)
CREATE POLICY "Produtos podem ser visualizados por todos" ON produtos
  FOR SELECT 
  USING (ativo = true);

-- Política para admins gerenciarem produtos da empresa
CREATE POLICY "Admins podem gerenciar produtos da empresa" ON produtos
  FOR ALL 
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM funcionarios 
      WHERE funcionarios.id::text = auth.uid()::text
      AND funcionarios.nivel_acesso = 'admin'
      AND funcionarios.ativo = true
    )
  )
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id 
      FROM funcionarios 
      WHERE funcionarios.id::text = auth.uid()::text
      AND funcionarios.nivel_acesso = 'admin'
      AND funcionarios.ativo = true
    )
  );

-- Inserir empresa_id automaticamente baseado no usuário logado
CREATE OR REPLACE FUNCTION set_produto_empresa_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar empresa_id do funcionário logado
  SELECT empresa_id INTO NEW.empresa_id
  FROM funcionarios 
  WHERE funcionarios.id::text = auth.uid()::text;
  
  -- Se não encontrou, usar a primeira empresa (fallback)
  IF NEW.empresa_id IS NULL THEN
    SELECT id INTO NEW.empresa_id FROM empresas LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para definir empresa_id automaticamente
DROP TRIGGER IF EXISTS set_produto_empresa_id_trigger ON produtos;
CREATE TRIGGER set_produto_empresa_id_trigger
  BEFORE INSERT ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION set_produto_empresa_id();