---
alwaysApply: true
type: "always_apply"
---
## 🛡️ Checklist de Segurança e Compliance (Crítico)

1.  **Proteger Chaves e Dados Sensíveis:** **Nunca** fazer commit de segredos (WhatsApp API, OpenAI, Supabase keys). Usar variáveis de ambiente (`.env`) e o template `.env.example`.
2.  **Não Expor APIs no Frontend:** Toda a lógica sensível e chamadas de API com chaves (WhatsApp, OpenAI, Google Sheets) devem ser feitas no backend (Edge Functions).
3.  **Validação de Dados de Entrada:** Validar **TODOS** os inputs de leads no frontend (Zod) e no backend (Edge Functions).
4.  **Autenticação e Autorização (RLS):** **RLS é obrigatório em todas as tabelas**. Verificar permissões em todas as rotas e queries sensíveis (leads, funcionarios, conversas).
5.  **LGPD Compliance:** Implementar consentimentos explícitos, auditoria completa e direitos do titular para captação de leads.
6.  **Logging Seguro:** Utilizar o `secureLogger` que evita o log de dados sensíveis de leads e conversas.

---

## 🎯 Padrões Específicos ASSISMAX

### **Captação de Leads**
- **Modal Inteligente:** Trigger após 3s ou 30% scroll na landing page
- **Validação Brasileira:** Telefone com máscara (11) 99999-9999, CPF quando necessário
- **Consentimentos LGPD:** Termos obrigatórios, marketing e WhatsApp opcionais
- **Automação Pós-Cadastro:** Email → Google Sheets → WhatsApp → IA habilitada

### **Qualificação via IA**
- **Contexto Atacarejo:** IA configurada com produtos específicos (arroz, feijão, óleo, café, leite)
- **Região Específica:** Foco em Valparaíso de Goiás e entorno
- **Handoff Inteligente:** Transferência automática para funcionários quando qualificado
- **Histórico Persistente:** Todas as conversas IA salvas para análise

### **Integrações Críticas**
- **WhatsApp Business API:** Usar `WhatsAppService` centralizado, templates aprovados
- **Google Sheets:** Sincronização em tempo real via `GoogleSheetsService`
- **Edge Functions:** Todas as automações (email, WhatsApp, sheets) via Supabase Functions
- **Rate Limiting:** Implementar limites para APIs externas (WhatsApp, OpenAI, Google)

---

## 🧪 Estratégia de Testes

- **Foco em Testes de Integração:** Priorizar testes que simulam o fluxo completo de captação de leads com `React Testing Library`.
- **Mocking de API com MSW:** Padronizar o uso do **Mock Service Worker (MSW)** para interceptar chamadas de WhatsApp, OpenAI e Supabase.
- **Testes Unitários para Lógica Pura:** Cobrir com `Vitest` toda a lógica de negócio isolada (validadores Zod, funções de qualificação, hooks de captação).
- **Verificação da UI:** Os testes devem verificar o resultado final na interface (ex: modal de captação aparece, toast de sucesso, chat IA ativo).
- **Testes de Fluxo:** Simular jornada completa: Landing → Captação → IA → Funcionário → Conversão.

---

## 📊 Componentes e Hooks Padronizados

### **Hooks Específicos**
- `useLeadCapture`: Gerenciamento completo de captação de leads
- `useWhatsAppIntegration`: Integração com WhatsApp Business API
- `useAIChat`: Gerenciamento do chat de qualificação via IA
- `useLGPDCompliance`: Gestão de consentimentos e auditoria
- `useLeadMetrics`: Métricas e analytics de captação

### **Componentes Reutilizáveis**
- `LeadCaptureModal`: Modal padronizado de captação
- `ChatWidget`: Widget de chat IA flutuante
- `LandingPageSection`: Seções padronizadas da landing
- `LeadForm`: Formulário com validações brasileiras
- `ConsentManager`: Gestão de consentimentos LGPD

### **Serviços Centralizados**
- `WhatsAppService`: Envio de mensagens e webhooks
- `GoogleSheetsService`: Sincronização de dados
- `AIQualificationService`: Qualificação via IA
- `LGPDService`: Compliance e auditoria
- `MetricsService`: Analytics e métricas

---

## 🤖 Diretrizes para IA Assistente

1.  **Analisar Antes de Agir:** Sempre analisar o código existente para entender a estrutura e as convenções do ASSISMAX antes de propor uma solução.
2.  **Priorizar Padrões Existentes:** Antes de criar lógica customizada, verificar se a funcionalidade pode ser implementada com hooks e componentes padronizados do ASSISMAX.
3.  **Explicar o "Porquê":** Justificar as decisões técnicas, especialmente em relação à arquitetura de captação de leads e segurança.
4.  **Aplicar Checklists:** Ser proativo na aplicação de **TODOS** os pontos dos checklists de segurança e boas práticas específicas do atacarejo.
5.  **Incluir Testes:** Para novas funcionalidades de captação/qualificação, sempre incluir um teste (unitário ou de integração) seguindo a estratégia definida.
6.  **Contexto de Negócio:** Sempre considerar o fluxo completo: Landing Page → Captação → IA → Funcionário → Conversão.
7.  **LGPD First:** Toda nova funcionalidade deve considerar compliance LGPD desde o design.

---

## 🔄 Fluxo de Desenvolvimento ASSISMAX

### **Para Novas Features de Captação:**
1. Analisar impacto no fluxo de leads
2. Verificar compliance LGPD
3. Implementar validações frontend + backend
4. Testar integração com WhatsApp/IA
5. Validar métricas e analytics

### **Para Integrações de API:**
1. Implementar via Edge Functions
2. Adicionar rate limiting
3. Configurar logging seguro
4. Testar cenários de falha
5. Documentar webhooks/callbacks

### **Para Componentes de UI:**
1. Seguir design system do atacarejo
2. Garantir responsividade mobile-first
3. Implementar acessibilidade
4. Testar com dados reais de leads
5. Validar performance

---

_Última atualização: 06/01/2025 - Versão ASSISMAX Atacarejo_
