---
type: "always_apply"
---

---
# METADADOS PARA PROCESSAMENTO POR IA
version: 3.1 # Versão com padrões de código específicos do ASSISMAX
linguagem: pt-BR
codificacao: UTF-8
ultima_atualizacao: 2025-01-06T14:00:00-03:00
contexto_ia:
  - tipo_regras: diretrizes_desenvolvimento_avancadas_com_padroes_assismax
  - dominio: plataforma_captacao_leads_atacarejo_assismax
  - complexidade: alta
  - tecnologias: [react, typescript, supabase, whatsapp-api, openai e Deep Seek, tanstack-query, zod, react-hook-form, tailwind]
# CATEGORIAS PRINCIPAIS
regras:
  compreensao_codigo:
    prioridade: alta
    diretrizes:
      - "analise_codigo_existente_antes_solucao: Antes de propor soluções, analisar o código existente para entender a estrutura e convenções do ASSISMAX."
      - "identificacao_causa_raiz_antes_correcao: Ao encontrar problemas, identificar a causa raiz antes de sugerir correções."
      - "priorizacao_simplicidade: No ASSISMAX, sempre priorizar soluções simples e funcionais, utilizando os padrões existentes de captação de leads."

  estilo_codigo_e_boas_praticas:
    prioridade: critica
    diretrizes:
      - "dry_principle_assismax: Evitar duplicação de código (DRY) utilizando os hooks e componentes genéricos do projeto: `useLeadCapture`, `useWhatsAppIntegration`, `LeadForm`, `ChatWidget`, `LandingPageSection`."
      - "limite_tamanho_arquivos_critico: Arquivos não devem exceder 400-500 linhas. Refatorar arquivos maiores em módulos menores, aplicando os padrões do projeto."
      - "typescript_consistente: Proibir `any`, tipar todas as props, usar `interface` para objetos e `type` para uniões/aliases, e utilizar os tipos centralizados em `src/types` (Lead, Empresa, Funcionario, Conversa)."
      - "componentes_bem_estruturados: Manter componentes pequenos e focados, com responsabilidade única para captação e qualificação de leads."
      - "gerenciamento_estado_eficiente: Usar TanStack Query para estado do servidor (leads, conversas, métricas). Evitar 'prop drilling'."
      - "separacao_logica_apresentacao: Isolar lógica de negócio em hooks (`/hooks`) e serviços (`/services`), mantendo componentes focados na UI de captação."
      - "estrutura_organizacao_projeto: Manter a estrutura de arquivos e pastas definida para landing page, dashboard e integrações."

  seguranca:
    prioridade: critica
    diretrizes:
      - "proteger_chaves_dados_sensiveis: Nunca fazer commit de segredos (WhatsApp API, OpenAI, Supabase keys). Usar variáveis de ambiente e `.env.example`."
      - "nao_expor_apis_frontend: Toda a lógica com chaves (WhatsApp, OpenAI, Google Sheets) deve ocorrer no backend (Edge Functions)."
      - "validacao_entrada_dupla: Validar TODOS os inputs de leads no frontend (Zod) e no backend."
      - "rls_obrigatorio: Implementar Row Level Security (RLS) no Supabase de forma rigorosa para todas as tabelas (leads, funcionarios, conversas)."
      - "lgpd_compliance: Implementar conformidade LGPD rigorosa com consentimentos, auditoria e direitos do titular."

  implementacao_e_testes:
    prioridade: alta
    diretrizes:
      - "divisao_tarefas_complexas_etapas: Dividir implementações complexas (integração WhatsApp, IA, automações) em etapas incrementais e testáveis."
      - "estrategia_testes_robusta: Para cada nova funcionalidade de captação/qualificação, implementar testes seguindo o padrão do projeto."
      - "tratamento_erros_robusto: Utilizar sistema de tratamento de erros centralizado para falhas de integração (WhatsApp, IA, Supabase)."
      - "commits_atomicos_significativos: Fazer commits pequenos, focados em uma única mudança lógica (ex: 'feat: adicionar validação telefone brasileiro')."

  integracao_apis_assismax:
    prioridade: critica
    diretrizes:
      - "whatsapp_api_padronizada: Usar sempre o serviço centralizado `WhatsAppService` para envio de mensagens e webhooks."
      - "openai_contexto_atacarejo: Configurar prompts da IA com contexto específico do atacarejo (produtos, preços, região Valparaíso GO)."
      - "supabase_edge_functions: Implementar automações (email, sheets, whatsapp) via Edge Functions para performance e segurança."
      - "google_sheets_sincronizacao: Manter sincronização em tempo real de leads via `GoogleSheetsService`."
      - "rate_limiting: Implementar rate limiting para todas as APIs externas (WhatsApp, OpenAI, Google)."

  formato_respostas_ia:
    prioridade: media
    diretrizes:
      - "detalhamento_tecnico_funcionamento_codigo: Fornecer explicações técnicas detalhadas sobre como e por que o código proposto funciona, mencionando os padrões ASSISMAX aplicados."
      - "exemplos_praticos_assismax: Fornecer exemplos práticos contextualizados para o domínio de atacarejo (captação de leads, qualificação, produtos como arroz, feijão, óleo)."
      - "fluxo_captacao_completo: Sempre considerar o fluxo completo: Landing Page → Captação → IA → Funcionário → Conversão."
---
