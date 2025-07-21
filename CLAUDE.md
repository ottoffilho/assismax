# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ASSISMAX** - Sistema de captação e qualificação de leads para atacarejo (wholesale) B2C. Plataforma digital que automatiza a captação de leads via landing page, qualifica via IA e distribui para atendimento humano via WhatsApp.

**Contexto de Negócio:**
- Atacarejo em Valparaíso de Goiás com 3 funcionários
- Foco em produtos básicos: arroz, feijão, óleo, café, leite
- R$ 500k/mês de faturamento
- Atendimento personalizado via WhatsApp

## Development Commands

```bash
# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linting (includes TypeScript check and unused variables disabled)
npm run lint

# Preview production build
npm run preview

# Install dependencies
npm install
```

## Architecture & Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** com design system customizado
- **shadcn/ui** (Radix UI components)
- **React Router DOM v6** - 4 rotas principais:
  - `/` - Landing page
  - `/admin` - Dashboard proprietário
  - `/funcionarios` - Dashboard funcionários
  - `*` - 404 page
- **TanStack Query** para server state
- **React Hook Form** + **Zod** para validações

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Edge Functions + Storage)
- **Database Schema**:
  - `empresas` - Multi-tenant ready
  - `funcionarios` - Usuários com níveis de acesso
  - `leads` - Captação com status e atribuição
  - `consentimentos` - LGPD compliance
  - `conversas` - Atendimento humano
  - `produtos` - Catálogo (fase 2)
  - `audit_logs` - Auditoria LGPD
  - `metricas` - Analytics
- **Row Level Security (RLS)** obrigatório em todas as tabelas
- **Triggers** para auditoria automática e métricas

### Integrations
- **WhatsApp Business API** - Mensageria automatizada
- **OpenAI/Claude API** - Qualificação por IA  
- **Google Sheets API** - Sincronização via N8N
- **Email** - Notificações
- **N8N** - Workflow automation e integrações
- **Google Analytics** - Tracking opcional

### Edge Functions
- `capture-lead` - Processamento completo de novos leads com:
  - Validações de email e telefone brasileiro
  - Verificação de duplicatas
  - Inserção em BD + consentimentos LGPD + métricas
  - Trigger para automações
- `lead-automation` - Automação e integração com N8N
- `ai-conversation` - Chatbot inteligente para qualificação

## Key Business Logic Hooks

### `useLeadCapture`
- Validação completa de formulários
- Formato telefone brasileiro: (11) 99999-9999
- Integração com Edge Function
- Gestão de consentimentos LGPD

### `useDashboard`
- Métricas agregadas em tempo real
- Refetch automático a cada 5 minutos
- KPIs: leads hoje/semana/mês, taxa conversão

### `useLeads`
- Listagem com filtros avançados
- Paginação e busca
- Actions para status e atribuição

### Dashboard Architecture
- **AdminDashboard** - Métricas completas, gestão de leads, analytics
- **FuncionariosDashboard** - View simplificada para atendimento
- **Dashboard Components**:
  - `KPICard` - Métricas em tempo real
  - `LeadsFilters` - Filtros avançados com debounce
  - `LeadsTable` - Tabela com actions inline


## Lead Capture Flow

1. **Landing Page** - Usuário acessa página responsiva
2. **Modal Trigger** - Aparece após 3s ou 30% scroll
3. **Form Validation** - Nome, telefone, email + consentimentos
4. **Supabase Storage** - Lead salvo com audit trail
5. **Edge Functions** - Disparam automações:
   - Email de boas-vindas
   - Google Sheets sync
   - WhatsApp mensagem inicial
6. **Human Handoff** - Lead vai para funcionário para atendimento

## LGPD & Security Guidelines

### Obrigatório
- **Nunca commitar secrets** - Use variáveis de ambiente
- **Lógica sensível no backend** - APIs apenas em Edge Functions
- **Validação dupla** - Frontend (Zod) + Backend
- **RLS em todas as tabelas** - Sem exceções
- **Audit trail completo** - Todas operações logadas
- **Consentimentos explícitos** - Versioned e rastreados

### Padrões de Segurança
- `secureLogger` para evitar log de dados sensíveis
- Validação de formato brasileiro (telefone, CPF)
- IP e user-agent tracking para compliance

## Code Standards

### TypeScript
- **Permissive mode** - Configurado para desenvolvimento ágil com:
  - `noImplicitAny: false`
  - `noUnusedParameters: false`  
  - `noUnusedLocals: false`
  - `strictNullChecks: false`
- **Tipos centralizados** - `src/integrations/supabase/types.ts` (auto-generated)
- **Validação em runtime** - Zod para forms, Supabase para DB
- **Path mapping** - `@/*` → `./src/*` configurado

### React Patterns
- **Composition over inheritance**
- **Custom hooks** para lógica reutilizável
- **Arquivos < 400-500 linhas**
- **Mobile-first** responsivo

### Commits
- **Atomic commits** - Pequenos e focados
- **Conventional commits** - feat:, fix:, chore:
- **Português BR** em mensagens

## Testing Strategy

- **Não configurado ainda** - Framework de testes não implementado
- **Planejado**: React Testing Library + Vitest
- **MSW** para mock de APIs (quando implementado)
- **Foco em integração** - Fluxo completo Landing → Captura → IA → Conversão

## Configuration

- **Vite**: Host `::` porta 8080, React SWC plugin, Lovable tagger em dev
- **Path alias**: `@/` → `./src/`
- **ESLint**: 
  - React + TypeScript + hooks rules
  - `@typescript-eslint/no-unused-vars: off` - variáveis não utilizadas permitidas
  - `react-refresh/only-export-components` warnings
- **TypeScript Project References**: `tsconfig.app.json` e `tsconfig.node.json`

## Business Context

**Produtos principais**: Arroz, feijão, óleo, café, leite, bebidas
**Região**: Valparaíso de Goiás - GO
**Modelo**: B2C atacarejo com atendimento personalizado
**Diferencial**: Preços de atacado para famílias

## Important Notes

- **Sempre falar em português brasileiro**
- **Mobile-first é crítico** - Maioria acessa via celular
- **Simplicidade no UX** - Público não é tech-savvy
- **Performance matters** - Conexões lentas são comuns
- **WhatsApp é rei** - Principal canal de conversão
- **Preciso que sempre fale em PT-BR**

## Current Status

✅ **Implementado:**
- Landing page com captura
- Schema Supabase completo
- **Dashboards admin/funcionários COMPLETOS**
- **Sistema de gestão de leads avançado**
- Fundação LGPD
- Sistema de design responsivo
- **Hooks com validação em tempo real**
- **Edge Functions production-ready**
- **N8N workflow automation**

🔄 **Em Desenvolvimento:**
- Integração WhatsApp Business (infraestrutura pronta)
- **Testes automatizados** (framework configurado)
- **Deploy production** (Vercel + Supabase)
- Analytics avançados (charts implementados)

📋 **Próximos Passos:**
- Testes de integração
- Deploy Vercel + Supabase
- Configurar domínio customizado
- Onboarding funcionários
- Campanhas de tráfego