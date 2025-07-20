-- =====================================================
-- SCHEMA COMPLETO ASSISMAX ATACAREJO - SUPABASE
-- =====================================================

-- 1. TABELA DE EMPRESAS (Multi-tenant preparado)
-- =====================================================
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  configuracoes JSONB DEFAULT '{}',
  plano VARCHAR(50) DEFAULT 'basico',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE FUNCIONÁRIOS
-- =====================================================
CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  nivel_acesso VARCHAR(20) DEFAULT 'funcionario' CHECK (nivel_acesso IN ('admin', 'funcionario')),
  ativo BOOLEAN DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE LEADS
-- =====================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  origem VARCHAR(50) DEFAULT 'landing_page',
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'qualificado', 'convertido', 'perdido')),
  funcionario_id UUID REFERENCES funcionarios(id),
  observacoes TEXT,
  dados_adicionais JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE CONSENTIMENTOS LGPD
-- =====================================================
CREATE TABLE consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  aceite_termos BOOLEAN NOT NULL,
  aceite_marketing BOOLEAN NOT NULL DEFAULT false,
  aceite_whatsapp BOOLEAN NOT NULL DEFAULT false,
  ip_origem INET,
  user_agent TEXT,
  politica_versao VARCHAR(10) DEFAULT '1.0',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE CONVERSAS IA
-- =====================================================
CREATE TABLE conversas_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  resposta TEXT NOT NULL,
  contexto JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE CONVERSAS (WhatsApp/Atendimento)
-- =====================================================
CREATE TABLE conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  funcionario_id UUID REFERENCES funcionarios(id),
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('whatsapp', 'telefone', 'email', 'chat_web')),
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('enviada', 'recebida')),
  mensagem TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  lida BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE PRODUTOS (Preparado para fase 2)
-- =====================================================
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco_varejo DECIMAL(10,2),
  preco_atacado DECIMAL(10,2),
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE AUDITORIA LGPD
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_tabela VARCHAR(50) NOT NULL,
  operacao VARCHAR(10) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  id_registro UUID NOT NULL,
  usuario_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE MÉTRICAS
-- =====================================================
CREATE TABLE metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  valor DECIMAL(10,2) DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  data DATE DEFAULT CURRENT_DATE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para leads
CREATE INDEX idx_leads_empresa_id ON leads(empresa_id);
CREATE INDEX idx_leads_funcionario_id ON leads(funcionario_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_telefone ON leads(telefone);

-- Índices para conversas
CREATE INDEX idx_conversas_lead_id ON conversas(lead_id);
CREATE INDEX idx_conversas_funcionario_id ON conversas(funcionario_id);
CREATE INDEX idx_conversas_timestamp ON conversas(timestamp);
CREATE INDEX idx_conversas_canal ON conversas(canal);

-- Índices para conversas IA
CREATE INDEX idx_conversas_ia_lead_id ON conversas_ia(lead_id);
CREATE INDEX idx_conversas_ia_timestamp ON conversas_ia(timestamp);

-- Índices para funcionários
CREATE INDEX idx_funcionarios_empresa_id ON funcionarios(empresa_id);
CREATE INDEX idx_funcionarios_email ON funcionarios(email);

-- Índices para métricas
CREATE INDEX idx_metricas_empresa_id ON metricas(empresa_id);
CREATE INDEX idx_metricas_tipo ON metricas(tipo);
CREATE INDEX idx_metricas_data ON metricas(data);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS
-- =====================================================

-- Funcionários só veem dados da própria empresa
CREATE POLICY "funcionarios_propria_empresa" ON funcionarios
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE id = auth.uid()
    )
  );

-- Funcionários só veem leads atribuídos a eles ou não atribuídos
CREATE POLICY "funcionarios_seus_leads" ON leads
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE id = auth.uid()
    )
    AND (
      funcionario_id = auth.uid() 
      OR funcionario_id IS NULL
      OR EXISTS (
        SELECT 1 FROM funcionarios 
        WHERE id = auth.uid() 
        AND nivel_acesso = 'admin'
      )
    )
  );

-- Conversas só para funcionários da empresa
CREATE POLICY "conversas_empresa" ON conversas
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE empresa_id IN (
        SELECT empresa_id FROM funcionarios 
        WHERE id = auth.uid()
      )
    )
  );

-- Conversas IA só para funcionários da empresa
CREATE POLICY "conversas_ia_empresa" ON conversas_ia
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE empresa_id IN (
        SELECT empresa_id FROM funcionarios 
        WHERE id = auth.uid()
      )
    )
  );

-- Consentimentos só para funcionários da empresa
CREATE POLICY "consentimentos_empresa" ON consentimentos
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE empresa_id IN (
        SELECT empresa_id FROM funcionarios 
        WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- =====================================================

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      nome_tabela, operacao, id_registro, usuario_id, 
      dados_antigos, ip_address, timestamp
    ) VALUES (
      TG_TABLE_NAME, TG_OP, OLD.id, auth.uid(), 
      row_to_json(OLD), inet_client_addr(), NOW()
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      nome_tabela, operacao, id_registro, usuario_id,
      dados_antigos, dados_novos, ip_address, timestamp
    ) VALUES (
      TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(),
      row_to_json(OLD), row_to_json(NEW), inet_client_addr(), NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      nome_tabela, operacao, id_registro, usuario_id,
      dados_novos, ip_address, timestamp
    ) VALUES (
      TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(),
      row_to_json(NEW), inet_client_addr(), NOW()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de auditoria nas tabelas principais
CREATE TRIGGER audit_leads
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_funcionarios
  AFTER INSERT OR UPDATE OR DELETE ON funcionarios
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_conversas
  AFTER INSERT OR UPDATE OR DELETE ON conversas
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- =====================================================
-- TRIGGERS PARA AUTOMAÇÃO DE LEADS
-- =====================================================

-- Função para automação quando novo lead é criado
CREATE OR REPLACE FUNCTION trigger_novo_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir métrica de lead captado
  INSERT INTO metricas (empresa_id, tipo, valor, metadata)
  VALUES (NEW.empresa_id, 'lead_captado', 1, 
    json_build_object('origem', NEW.origem, 'lead_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para novos leads
CREATE TRIGGER novo_lead_automacao
  AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION trigger_novo_lead();

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR UPDATED_AT AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas que têm updated_at
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funcionarios_updated_at
  BEFORE UPDATE ON funcionarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERÇÃO DE DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir empresa exemplo (AssisMax)
INSERT INTO empresas (nome, slug, telefone, email, endereco, configuracoes) VALUES 
('AssisMax Atacarejo', 'assismax', '(61) 99999-9999', 'contato@assismax.com.br', 
'Valparaíso de Goiás - GO', 
'{"tema": "light", "timezone": "America/Sao_Paulo", "whatsapp_api_enabled": false}'
);

-- Inserir usuário admin inicial
INSERT INTO funcionarios (empresa_id, nome, email, telefone, nivel_acesso) VALUES 
(
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  'Administrador', 
  'admin@assismax.com.br', 
  '(61) 99999-9999', 
  'admin'
);

-- Inserir produtos iniciais
INSERT INTO produtos (empresa_id, nome, categoria, descricao, preco_varejo, preco_atacado, estoque, ativo) VALUES 
(
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  'Arroz Tipo 1', 'Alimentos', 'Arroz branco tipo 1, saco 5kg', 25.90, 22.50, 100, true
),
(
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  'Feijão Carioca', 'Alimentos', 'Feijão carioca, saco 1kg', 8.90, 7.50, 150, true
),
(
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  'Óleo de Soja', 'Alimentos', 'Óleo de soja refinado, 900ml', 4.50, 3.80, 200, true
),
(
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  'Café Torrado', 'Bebidas', 'Café torrado e moído, 500g', 12.90, 11.20, 80, true
),
(
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  'Leite Integral', 'Bebidas', 'Leite integral UHT, 1L', 4.20, 3.70, 120, true
);

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View para dashboard do proprietário
CREATE VIEW dashboard_proprietario AS
SELECT 
  e.nome as empresa,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'novo' THEN 1 END) as leads_novos,
  COUNT(CASE WHEN l.status = 'em_atendimento' THEN 1 END) as leads_em_atendimento,
  COUNT(CASE WHEN l.status = 'convertido' THEN 1 END) as leads_convertidos,
  COUNT(CASE WHEN l.created_at >= CURRENT_DATE THEN 1 END) as leads_hoje,
  COUNT(CASE WHEN l.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_semana
FROM empresas e
LEFT JOIN leads l ON e.id = l.empresa_id
GROUP BY e.id, e.nome;

-- View para performance dos funcionários
CREATE VIEW performance_funcionarios AS
SELECT 
  f.nome as funcionario,
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
GROUP BY f.id, f.nome;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE empresas IS 'Tabela principal de empresas - preparada para multi-tenant';
COMMENT ON TABLE funcionarios IS 'Funcionários/usuários do sistema com níveis de acesso';
COMMENT ON TABLE leads IS 'Leads captados via landing page ou outros canais';
COMMENT ON TABLE consentimentos IS 'Consentimentos LGPD para cada lead';
COMMENT ON TABLE conversas_ia IS 'Histórico de conversas com chatbot IA';
COMMENT ON TABLE conversas IS 'Conversas via WhatsApp, telefone, email';
COMMENT ON TABLE produtos IS 'Catálogo de produtos para fase 2';
COMMENT ON TABLE audit_logs IS 'Log de auditoria para compliance LGPD';
COMMENT ON TABLE metricas IS 'Métricas e analytics do sistema';