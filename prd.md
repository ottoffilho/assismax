# PRD COMPLETO - SISTEMA DE ATACAREJO DIGITAL

## 1. VISÃO GERAL DO PRODUTO

### **Informações da Empresa**
- **Nome**: [A definir - sugestões: CerraDistri, MaxiDistri, BrasilBox Atacarejo]
- **Região**: Valparaíso de Goiás - GO (expansão para Goiás e Brasil)
- **Porte**: 3 funcionários, R$ 500k/mês faturamento
- **Modelo**: Atacarejo focado em pessoa física (PF)

### **Objetivo Principal**
Criar uma plataforma digital de captação e qualificação de leads para empresa de atacarejo, com foco inicial em clientes PF na região de Valparaíso de Goiás, com arquitetura escalável para expansão nacional.

### **Problema a Resolver**
- Funcionários focam apenas em atendimento reativo
- Falta de sistema proativo para captação de novos clientes
- Necessidade de qualificar leads antes do atendimento humano
- Controle descentralizado de leads (WhatsApp, planilhas)
- Ausência de conformidade LGPD

### **Proposta de Valor**
- Captação automatizada de leads via landing page otimizada
- Qualificação inteligente via IA antes do atendimento humano
- Centralização e organização de todos os contatos
- Aumento da conversão e otimização do tempo dos funcionários
- Compliance total com LGPD

## 2. PERSONAS DEFINIDAS

### **Persona 1: Cliente Potencial (Lead)**
- **Demografia**: Famílias de Valparaíso de Goiás e região
- **Comportamento**: Busca preços melhores em produtos básicos
- **Motivação**: Economia doméstica, qualidade, conveniência
- **Jornada**: Vê anúncio → Acessa landing → Cadastra → Conversa com IA → Atendimento humano
- **Produtos de interesse**: Arroz, Feijão, Óleo, Café, Leite, Bebidas

### **Persona 2: Proprietário**
- **Objetivo**: Aumentar vendas e ter controle total do negócio
- **Necessidades**: Dashboard executivo, relatórios, controle de funcionários
- **Tecnologia**: Moderada, prefere simplicidade
- **Prioridade**: Vendas > Controle operacional

### **Persona 3: Funcionários (3 pessoas)**
- **Função**: Atendimento reativo via WhatsApp/telefone
- **Necessidade**: Interface simples para gerenciar seus atendimentos
- **Limitação**: Acesso restrito apenas aos próprios leads
- **Perfil**: Atendimento interno, sem vendas externas

## 3. ARQUITETURA TÉCNICA

### **3.1 Stack Principal**
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **IA**: OpenAI GPT-4 ou Claude (via API)
- **Integrações**: Google Sheets API, WhatsApp Business API
- **Deploy**: Vercel (frontend) + Supabase (backend)
- **Monitoramento**: Vercel Analytics + Sentry + Supabase Logs

### **3.2 Estrutura do Banco de Dados (Supabase)**

```sql
-- Empresas (preparado para multi-tenant)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  telefone VARCHAR,
  email VARCHAR,
  endereco TEXT,
  configuracoes JSONB DEFAULT '{}',
  plano VARCHAR DEFAULT 'basico',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Funcionários
CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  telefone VARCHAR,
  nivel_acesso VARCHAR DEFAULT 'funcionario', -- 'admin', 'funcionario'
  ativo BOOLEAN DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  telefone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  origem VARCHAR DEFAULT 'landing_page',
  status VARCHAR DEFAULT 'novo', -- 'novo', 'em_atendimento', 'qualificado', 'convertido', 'perdido'
  funcionario_id UUID REFERENCES funcionarios(id),
  observacoes TEXT,
  dados_adicionais JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consentimentos LGPD
CREATE TABLE consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  aceite_termos BOOLEAN NOT NULL,
  aceite_marketing BOOLEAN NOT NULL,
  aceite_whatsapp BOOLEAN NOT NULL,
  ip_origem INET,
  user_agent TEXT,
  politica_versao VARCHAR DEFAULT '1.0',
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Conversas IA
CREATE TABLE conversas_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  resposta TEXT NOT NULL,
  contexto JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Conversas WhatsApp/Atendimento
CREATE TABLE conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  funcionario_id UUID REFERENCES funcionarios(id),
  canal VARCHAR NOT NULL, -- 'whatsapp', 'telefone', 'email', 'chat_web'
  tipo VARCHAR NOT NULL, -- 'enviada', 'recebida'
  mensagem TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  lida BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Produtos (preparado para fase 2)
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR NOT NULL,
  categoria VARCHAR NOT NULL,
  descricao TEXT,
  preco_varejo DECIMAL(10,2),
  preco_atacado DECIMAL(10,2),
  estoque INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  imagem_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auditoria LGPD
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela VARCHAR NOT NULL,
  operacao VARCHAR NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  registro_id UUID NOT NULL,
  usuario_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Métricas e Analytics
CREATE TABLE metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR NOT NULL, -- 'lead_captado', 'conversa_iniciada', 'lead_convertido'
  valor DECIMAL(10,2) DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  data DATE DEFAULT CURRENT_DATE,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### **3.3 Row Level Security (RLS)**

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas_ia ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Funcionários só veem leads da própria empresa e atribuídos a eles
CREATE POLICY "Funcionarios veem apenas seus leads" ON leads
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE funcionarios.id = auth.uid()
    )
    AND (funcionario_id = auth.uid() OR funcionario_id IS NULL)
  );

-- Admins veem tudo da empresa
CREATE POLICY "Admins veem tudo da empresa" ON leads
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM funcionarios 
      WHERE funcionarios.id = auth.uid() 
      AND nivel_acesso = 'admin'
    )
  );
```

## 4. FEATURES PRIORITIZADAS

### **FASE 1 - MVP (Meses 1-3)**

#### **4.1 Landing Page Inteligente**

**Componentes:**
- **Header responsivo**: Logo, menu navegação (Produtos, Sobre, Contato)
- **Hero Section**: Banner atrativo com proposta de valor clara
- **Modal de captação**: Aparece após 3s ou scroll 30%
- **Seções principais**:
  - Produtos em destaque (Arroz, Feijão, Óleo, Café, Leite)
  - Benefícios do atacarejo
  - Depoimentos/social proof
  - Call-to-action secundários

**Modal de Captação:**
```typescript
interface LeadForm {
  nome: string // Obrigatório, min 2 caracteres
  telefone: string // Máscara brasileira, validação
  email: string // Validação email válido
  aceite_termos: boolean // Obrigatório LGPD
  aceite_marketing: boolean // Opcional
  aceite_whatsapp: boolean // Opcional
}
```

**Validações:**
- Nome: Mínimo 2 caracteres, apenas letras e espaços
- Telefone: Formato brasileiro (11) 99999-9999
- Email: RFC 5322 compliant
- Consentimentos: Termos obrigatório, outros opcionais

#### **4.2 Sistema de Captação e Automação**

**Fluxo Pós-Cadastro:**
1. **Validação e salvamento** no Supabase
2. **Trigger automático** dispara Edge Function
3. **Email para proprietário** com dados do lead
4. **Atualização Google Sheets** em tempo real
5. **WhatsApp de boas-vindas** (se consentimento dado)
6. **Liberação do chat IA** para qualificação

**Edge Function de Automação:**
```typescript
// supabase/functions/lead-automation/index.ts
const automationFlow = {
  1: 'sendOwnerEmail',      // Email instantâneo
  2: 'updateGoogleSheets',  // Planilha atualizada
  3: 'sendWelcomeWhatsApp', // WhatsApp (se autorizado)
  4: 'enableAIChat',        // Acesso ao chat IA
  5: 'scheduleFollowUp',    // Follow-up em 24h
  6: 'updateMetrics'        // Analytics
}
```

#### **4.3 Chat IA Qualificado**

**Funcionalidades:**
- **Widget flutuante** responsivo
- **IA contextualizada** com dados da empresa
- **Qualificação automática**: Urgência, tipo de cliente, produtos
- **Handoff inteligente**: Transferência para funcionário
- **Histórico persistente**: Todas as conversas salvas

**Prompt Base da IA:**
```
Você é Maria, consultora de vendas da [NOME_EMPRESA].
Somos uma empresa de atacarejo em Valparaíso de Goiás.

PRODUTOS PRINCIPAIS:
- Arroz, Feijão, Óleo, Café, Leite
- Bebidas: Refrigerantes, sucos, águas
- Bebidas destiladas (licenciadas)

INFORMAÇÕES IMPORTANTES:
- Atendemos pessoa física (PF)
- Preços de atacarejo (melhores que supermercados)
- Fazemos entrega na região
- Pagamento: PIX, cartão
- Horário: [DEFINIR HORÁRIO]

SEU OBJETIVO:
1. Qualificar o interesse do cliente
2. Identificar produtos de maior interesse
3. Verificar urgência da necessidade
4. Agendar contato com nossa equipe

TOM: Profissional, acolhedor e consultivo.
```

**Lógica de Qualificação:**
```typescript
interface QualificationData {
  interesse_nivel: 'baixo' | 'medio' | 'alto'
  produtos_interesse: string[]
  urgencia: 'baixa' | 'media' | 'alta'
  orcamento_estimado: 'ate_100' | '100_500' | 'acima_500'
  frequencia_compra: 'esporadica' | 'mensal' | 'quinzenal' | 'semanal'
}
```

#### **4.4 Dashboard Proprietário**

**Visão Geral:**
- **KPIs principais**: Leads hoje, semana, mês
- **Conversão**: Taxa de leads → clientes
- **Origem**: Qual canal traz mais leads
- **Funcionários**: Performance individual
- **Receita**: Estimativa baseada em conversões

**Métricas Importantes:**
- Leads captados (meta: 50/dia)
- Taxa de conversão landing (meta: 15%)
- Qualificação IA (meta: 70% qualificados)
- Tempo de resposta (meta: <2h)
- Conversão final (meta: 25%)

**Relatórios:**
- Exportação Excel/PDF
- Dados LGPD compliant
- Filtros por período, funcionário, origem

#### **4.5 Painel Funcionários**

**Interface Simplificada:**
- **Lista de leads** atribuídos
- **Status visual**: Novo, em andamento, convertido
- **Chat integrado**: WhatsApp via API
- **Histórico completo**: Todas as interações
- **Ações rápidas**: Marcar como convertido, transferir

**Fluxo de Atendimento:**
1. Funcionário vê lead na lista
2. Acessa histórico da conversa IA
3. Continua atendimento via WhatsApp
4. Atualiza status conforme progresso
5. Registra resultado final

#### **4.6 Conformidade LGPD**

**Implementações Obrigatórias:**
- **Consentimento explícito**: Checkboxes claros
- **Política de privacidade**: Acessível e compreensível
- **Portal do titular**: Cliente acessa/edita/exclui dados
- **Auditoria completa**: Todos os acessos logados
- **Criptografia**: Dados sensíveis protegidos
- **Retenção**: Dados excluídos após 2 anos

**Interface LGPD:**
```typescript
const LGPDCompliance = {
  consentModal: {
    required: ['aceite_termos'],
    optional: ['aceite_marketing', 'aceite_whatsapp'],
    version: '1.0'
  },
  
  dataPortal: {
    endpoints: ['/meus-dados', '/excluir-conta', '/exportar-dados'],
    authentication: 'email + código SMS'
  },
  
  audit: {
    allOperations: true,
    retention: '7 anos',
    encryption: 'AES-256'
  }
}
```

### **FASE 2 - EXPANSÃO (Meses 4-6)**

#### **4.7 E-commerce Básico**
- Catálogo de produtos com preços
- Carrinho de compras
- Checkout PIX/Cartão
- Gestão de pedidos
- Sistema de entrega

#### **4.8 Centro de Atendimento Unificado**
- Multi-canal (WhatsApp, telefone, email, chat)
- Roteamento inteligente de leads
- Análise de sentimento
- Templates de resposta
- Métricas avançadas de atendimento

#### **4.9 Sistema de Expansão**
- Multi-cidades configurável
- Gestão de estoque por localidade
- Funcionários por região
- Relatórios consolidados

## 5. INTEGRAÇÕES TÉCNICAS

### **5.1 WhatsApp Business API**

**Setup:**
- Cadastro no Meta Business Manager
- Aprovação da API (7-14 dias)
- Configuração de webhook
- Templates de mensagem aprovados

**Implementação:**
```typescript
// Serviço WhatsApp
class WhatsAppService {
  async sendMessage(to: string, message: string) {
    return fetch(`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ''),
        text: { body: message }
      })
    })
  }
  
  async sendTemplate(to: string, templateName: string, variables: string[]) {
    // Implementação para templates aprovados
  }
}
```

### **5.2 Google Sheets API**

**Configuração:**
- Service Account no Google Cloud
- Permissões na planilha
- Atualização em tempo real

**Implementação:**
```typescript
// Serviço Google Sheets
class GoogleSheetsService {
  async addLead(lead: Lead) {
    const values = [[
      lead.nome,
      lead.telefone,
      lead.email,
      lead.created_at,
      lead.origem
    ]]
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Leads!A:E',
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  }
}
```

### **5.3 OpenAI/Claude Integration**

```typescript
// Serviço IA
class AIService {
  async processMessage(message: string, context: any) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user", 
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
    
    return response.choices[0].message.content
  }
}
```

## 6. CRONOGRAMA DETALHADO

### **Sprint 1 (Semanas 1-2)**
- ✅ Configuração do ambiente (React + Vite + Supabase)
- ✅ Design system básico (Tailwind + componentes)
- ✅ Landing page responsiva
- ✅ Modal de captação com validações
- ✅ Integração Supabase básica

### **Sprint 2 (Semanas 3-4)**
- ✅ Edge Functions para automação
- ✅ Integração email (Resend/SendGrid)
- ✅ Google Sheets API
- ✅ LGPD compliance básico
- ✅ Testes de captação

### **Sprint 3 (Semanas 5-6)**
- ✅ Chat IA implementação
- ✅ Sistema de qualificação
- ✅ Dashboard proprietário
- ✅ Métricas básicas
- ✅ Solicitação WhatsApp Business API

### **Sprint 4 (Semanas 7-8)**
- ✅ Painel funcionários
- ✅ Sistema de atribuição
- ✅ WhatsApp API integration
- ✅ Testes integrados
- ✅ Deploy produção

### **Sprint 5 (Semanas 9-10)**
- ✅ Refinamentos UX/UI
- ✅ Otimizações de performance
- ✅ Analytics avançado
- ✅ Documentação
- ✅ Treinamento da equipe

### **Sprint 6 (Semanas 11-12)**
- ✅ Monitoramento em produção
- ✅ Ajustes baseados em feedback
- ✅ Preparação fase 2
- ✅ Planejamento expansão

## 7. MÉTRICAS DE SUCESSO

### **KPIs Principais**
- **Taxa de conversão landing**: Meta 15% (visitantes → cadastros)
- **Qualificação IA efetiva**: Meta 70% (leads qualificados úteis)
- **Tempo de resposta**: Meta <2h (lead → primeiro contato humano)
- **Conversão final**: Meta 25% (leads → clientes ativos)
- **Satisfação cliente**: Meta NPS >50

### **Métricas Operacionais**
- **Leads por dia**: Meta 50/dia
- **Custo por lead**: Acompanhar via marketing
- **Performance funcionários**: Conversão individual
- **Uptime sistema**: Meta 99.5%
- **Compliance LGPD**: 100% auditoria aprovada

### **Métricas de Negócio**
- **ROI marketing**: Receita / Investimento ads
- **LTV cliente**: Valor vida útil médio
- **CAC**: Custo aquisição cliente
- **Churn rate**: Taxa de abandono
- **Ticket médio**: Valor médio por venda

## 8. RISCOS E MITIGAÇÕES

### **Riscos Técnicos**
- **WhatsApp API demora**: Usar bridge temporário
- **Overload Supabase**: Implementar cache Redis
- **IA custos altos**: Limitar interações por lead
- **LGPD não compliance**: Auditoria jurídica prévia

### **Riscos de Negócio**
- **Baixa conversão**: A/B test landing page
- **Funcionários resistência**: Treinamento intensivo
- **Concorrência**: Foco na experiência do usuário
- **Sazonalidade**: Diversificar canais captação

### **Plano de Contingência**
- **Backup diário**: Dados críticos
- **Rollback automático**: Deploy com zero downtime
- **Suporte 24/7**: Para período crítico inicial
- **Monitoramento ativo**: Alertas automáticos

## 9. CUSTOS ESTIMADOS

### **Desenvolvimento (Meses 1-3)**
- **Desenvolvimento**: R$ [VALOR A DEFINIR]
- **Supabase Pro**: $25/mês
- **Vercel Pro**: $20/mês
- **OpenAI API**: ~$100/mês
- **WhatsApp Business**: ~R$ 150/mês

### **Operação Mensal**
- **Infraestrutura**: ~R$ 500/mês
- **APIs**: ~R$ 300/mês
- **Monitoramento**: ~R$ 200/mês
- **Total operacional**: ~R$ 1.000/mês

### **ROI Esperado**
- **Leads adicionais**: +1.500/mês
- **Conversão**: 25% = 375 novos clientes
- **Ticket médio**: R$ 200
- **Receita adicional**: R$ 75.000/mês
- **ROI**: 75x investimento

## 10. DEFINIÇÕES FINAIS

### **Próximos Passos Imediatos**
1. **Aprovação do PRD** pelo proprietário
2. **Definição do nome** da empresa
3. **Setup inicial** do projeto
4. **Solicitação WhatsApp Business API**
5. **Início desenvolvimento Sprint 1**

### **Critérios de Sucesso MVP**
- Sistema funcionando em produção
- Captação automatizada funcionando
- LGPD compliance completo
- Primeiros leads convertidos
- Funcionários treinados e usando

### **Entregáveis**
- ✅ Código fonte completo (GitHub)
- ✅ Documentação técnica
- ✅ Manual do usuário
- ✅ Políticas LGPD
- ✅ Treinamento da equipe
- ✅ Suporte pós-go-live (30 dias)

---

**Este PRD está completo e pronto para implementação. Todos os aspectos técnicos, legais e de negócio foram considerados para garantir o sucesso do projeto.**