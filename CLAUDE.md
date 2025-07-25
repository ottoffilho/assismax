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
# Start development server (port 8081)
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
- **WhatsApp Business API** - Mensageria automatizada via `WhatsAppService` centralizado
- **OpenAI/Claude API** - Qualificação por IA com contexto específico do atacarejo
- **DeepSeek API** - **NOVO**: AI provider para admin assistant (análise de dados)
- **Google Sheets API** - Sincronização em tempo real via `GoogleSheetsService`
- **Email** - Notificações automatizadas
- **N8N** - Workflow automation e integrações com webhooks
- **Google Analytics** - Tracking opcional

### Edge Functions (7 functions production-ready)
- `capture-lead` - Processamento completo de novos leads com:
  - Validações de email e telefone brasileiro
  - Verificação de duplicatas
  - Inserção em BD + consentimentos LGPD + métricas
  - Trigger para automações
- `lead-automation` - Automação e integração com N8N
- `ai-conversation` - Chatbot inteligente para qualificação
- `initial-setup` - Setup sistema (empresa + admin inicial)
- `create-funcionario` - Admin-only function para criação de funcionários
- `admin-ai-assistant` - **NOVO**: Chatbot inteligente para admins com:
  - Análise de dados em tempo real via DeepSeek API
  - Queries SQL dinâmicas baseadas em linguagem natural
  - Rate limiting (30 req/min) e auditoria completa
  - Insights de negócio e recomendações automatizadas
- `cleanup-auth` - **NOVO**: Utilitário para limpeza completa do sistema auth

## Design System & UI

### shadcn/ui Configuration
- **Base Path**: `@/components/ui` com custom configuration
- **Base Color**: Slate theme para consistência
- **CSS Variables**: Sistema de design tokens em `src/index.css`
- **Custom Components**: Radix UI + Tailwind customizations

### Brand & Theme System
- **AssisMax Identity**: Primary black (#000000) + accent yellow (#FFD700)
- **Custom CSS Variables**: Comprehensive color system para light/dark modes
- **Animation System**: Custom keyframes (`fade-in-up`, `pulse-glow`, `float`)
- **Logo Assets**: Multiple variations em `src/assets/logo/` (horizontal/vertical, light/dark)

### Responsive Design
- **Mobile-first**: Breakpoints Tailwind padrão
- **Design tokens**: Spacing, typography, shadows consistentes
- **Component variants**: Uso extensivo de cva (class-variance-authority)

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

### `useChatbotConversation`
- Gerencia conversas com chatbot IA
- Integração com Edge Function `ai-conversation`
- Personalidade definida em `assistantPersonality.ts`
- Context-aware para produtos do atacarejo

### `useAuth`
- **Dual Authentication Model**: Supabase Auth + funcionario table
- **Role-based Redirects**: Admin → `/admin`, Employee → `/funcionarios`
- **Session Management**: Token refresh e state persistence
- **Timeout Handling**: 5s timeout para queries DB

### `useAdminChatbot` - **NOVO**
- **AI-powered Admin Assistant**: Chatbot inteligente para análise de dados
- **Natural Language to SQL**: Converte perguntas em queries SQL dinâmicas
- **Typewriter Effect**: Animação de digitação para respostas
- **Real-time Analytics**: Consultas em tempo real com metadata completa
- **Rate Limiting**: Controle de uso (30 req/min) integrado
- **Context Awareness**: Histórico de conversação e contexto de negócio

### Dashboard Architecture
- **AdminDashboard** - Métricas completas, gestão de leads, analytics
- **FuncionariosDashboard** - View simplificada para atendimento
- **Dashboard Components**:
  - `KPICard` - Métricas em tempo real
  - `LeadsFilters` - Filtros avançados com debounce
  - `LeadsTable` - Tabela com actions inline
  - **Charts System**: `BarChart`, `DonutChart`, `LineChart` - Visualizações interativas
  - **Admin Tools**: `FuncionariosManager`, `ProdutosManager` - Gestão administrativa
  - **AI Assistant**: `AdminChatbotModal` - **NOVO**: Modal do assistente IA com interface rica
  - **Common Utils**: `EmptyState`, `ActivityFeed` - Estados e feedback visual


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
- **Nunca commitar secrets** - Use variáveis de ambiente (WhatsApp API, OpenAI, DeepSeek, Supabase keys)
- **Lógica sensível no backend** - Todas as integrações com APIs externas APENAS em Edge Functions
- **Validação dupla** - Frontend (Zod) + Backend obrigatório para TODOS os inputs de leads
- **RLS em todas as tabelas** - Sem exceções, implementação rigorosa
- **Audit trail completo** - Todas operações logadas para compliance LGPD
- **Consentimentos explícitos** - Versioned e rastreados com direitos do titular
- **Rate limiting** - Implementar para todas as APIs externas (WhatsApp, OpenAI, Google)

### Padrões de Segurança
- `secureLogger` para evitar log de dados sensíveis
- Validação de formato brasileiro (telefone, CPF)
- IP e user-agent tracking para compliance
- **Sistema de tratamento de erros centralizado** para falhas de integração

## Code Standards

### Development Rules Integration
- **Cursor/Augment Rules**: Comprehensive development guidelines in `.augment/rules/rules.md`
- **Business Context**: Specific patterns for atacarejo lead capture domain
- **Security Focus**: LGPD compliance and API integration patterns enforced
- **Code Quality**: DRY principles with reusable ASSISMAX components

### TypeScript
- **Permissive mode** - Configurado para desenvolvimento ágil com:
  - `noImplicitAny: false`
  - `noUnusedParameters: false`  
  - `noUnusedLocals: false`
  - `strictNullChecks: false`
- **Tipos centralizados** - `src/integrations/supabase/types.ts` (auto-generated)
- **Business Types** - `src/types/admin-chatbot.ts` - **NOVO**: Tipos complexos para:
  - `AdminMessage`, `AdminChatbotResponse` - Sistema de chatbot
  - `LeadsAnalytics`, `FuncionariosPerformance` - Analytics de negócio
  - `QueryAnalytics`, `AuditLog` - Auditoria e compliance
  - `BusinessInsight`, `MetricsTrend` - Insights automatizados
- **Validação em runtime** - Zod para forms, Supabase para DB
- **Path mapping** - `@/*` → `./src/*` configurado
- **IMPORTANTE**: Proibir uso de `any`, sempre tipar props, usar `interface` para objetos

### React Patterns
- **Composition over inheritance**
- **Custom hooks** para lógica reutilizável com hooks específicos: `useLeadCapture`, `useWhatsAppIntegration`
- **Arquivos < 400-500 linhas** - CRÍTICO: Refatorar se ultrapassar
- **Mobile-first** responsivo
- **DRY principle** - Reutilizar componentes: `LeadForm`, `ChatWidget`, `LandingPageSection`
- **Separação de responsabilidades** - Lógica em `/hooks` e `/services`, UI pura em componentes

### Commits
- **Atomic commits** - Pequenos e focados
- **Conventional commits** - feat:, fix:, chore:
- **Português BR** em mensagens
- **Contexto específico** - Ex: "feat: adicionar validação telefone brasileiro"

## Admin AI Assistant System - **NOVO SISTEMA COMPLETO**

### Arquitetura do Chatbot Administrativo
- **Edge Function**: `admin-ai-assistant` - Processa linguagem natural para SQL
- **AI Provider**: DeepSeek API - Modelo otimizado para análise de dados
- **Interface**: `AdminChatbotModal` - Modal Rico com typewriter effect
- **Hook**: `useAdminChatbot` - Gerenciamento de estado e conversação
- **Types**: `src/types/admin-chatbot.ts` - 244 linhas de tipagem completa

### Funcionalidades Avançadas
- **Natural Language to SQL**: Converte perguntas em português para queries SQL
- **Real-time Analytics**: Consultas diretas ao banco com metadata
- **Business Intelligence**: Insights automatizados e recomendações
- **Rate Limiting**: 30 requests/minuto com controle por usuário
- **Audit Trail**: Log completo de queries executadas
- **Security**: Validação de permissões admin-only e sanitização de queries

### Casos de Uso Implementados
- Analytics de leads: "Quantos leads novos hoje?", "Taxa de conversão por fonte"
- Performance de funcionários: "Qual funcionário converte mais?", "Produtividade da equipe"
- Análise de produtos: "Produtos mais consultados", "Otimização de preços"
- Métricas de negócio: "Funil de conversão", "Tendências de crescimento"
- Troubleshooting: "Leads abandonados", "Gargalos no processo"

### Interface Features
- **Quick Questions**: Sugestões categorizadas por ícones e cores
- **Typewriter Effect**: Animação de digitação realística
- **Raw Data Display**: Expandir dados brutos com formatação JSON
- **Online Status**: Indicadores visuais de disponibilidade
- **Context Awareness**: Histórico de conversação e contexto de negócio

## Testing Strategy

- **No test framework configured** - No npm test scripts available
- **Planned implementation**: React Testing Library + Vitest when implemented
- **MSW** for API mocking (when implemented)  
- **Integration focus** - Complete flow Landing → Capture → AI → Conversion
- **AI Testing**: Specific tests for admin chatbot and SQL query validation
- **Test utilities**: `test-webhook-debug.js` and `test-webhook-final.js` for webhook testing

## Authentication & Setup

### Dual Authentication Architecture
- **Supabase Auth + Custom Table**: Validação dupla com tabela `funcionarios`
- **State Management**: `isAuthenticated` (Supabase) vs `isValidUser` (custom logic)
- **Timeout Strategy**: 5s timeout para queries com fallback graceful
- **Session Persistence**: Token refresh automático e state sync

### Authentication Components
- **AuthContext**: Gerenciamento centralizado de estado e role-based redirects
- **ProtectedRoute**: HOC para proteção de rotas com verificação de roles
- **LoginModal**: Modal reutilizável com validação e error handling
- **Setup Page**: `/src/pages/Setup.tsx` - First-time setup automático

### Setup & Onboarding Flow
- **Initial Setup**: Edge Function `initial-setup` cria empresa + admin
- **Idempotent**: Verificações para evitar duplicação de configuração
- **Transactional**: Rollback automático em caso de falha
- **Employee Creation**: Admin pode criar funcionários via `create-funcionario`

### Access Levels
- **admin**: Proprietário com acesso completo (dashboards, gestão, métricas)
- **funcionario**: Funcionário com dashboard simplificado e gestão de leads

## Configuration

### Build & Development
- **Vite**: Host `::` porta 8080, React SWC plugin, Lovable tagger em dev
- **Path Aliases**: `@/` → `./src/` configurado em Vite + TypeScript
- **PostCSS**: Tailwind CSS + Autoprefixer pipeline
- **TypeScript Project References**: 
  - `tsconfig.json` - Root configuration com project references
  - `tsconfig.app.json` - App-specific config (src/*)
  - `tsconfig.node.json` - Node-specific config (vite.config.ts)

### Linting & Code Quality
- **ESLint Configuration**:
  - React + TypeScript + hooks rules
  - `@typescript-eslint/no-unused-vars: off` - Permite variáveis não utilizadas
  - `react-refresh/only-export-components` warnings apenas
- **Permissive TypeScript**: Configurado para desenvolvimento ágil

### Environment Variables Architecture
- **103+ Variables**: Categorizadas em 12 grupos funcionais:
  - **Supabase**: Project URL, Anon Key, Service Role
  - **APIs**: WhatsApp, OpenAI, **DeepSeek** (admin AI assistant), Google Sheets
  - **Regional**: Valparaíso de Goiás, CEP, coordenadas
  - **Business**: CNPJ, razão social, produtos principais
  - **LGPD**: Compliance settings, consent management
  - **Rate Limiting**: API throttling e usage limits (30 req/min admin chatbot)
  - **N8N**: Webhook endpoints e automation triggers

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
- **Sistema de autenticação completo** (dual auth + setup)
- **AI Admin Assistant COMPLETO** - Chatbot inteligente para análise de dados
- Fundação LGPD
- Sistema de design responsivo
- **Hooks com validação em tempo real**
- **Edge Functions production-ready** (7 funções incluindo admin AI)
- **N8N workflow automation**
- **TypeScript types sistema completo** (244 linhas de tipos de negócio)

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