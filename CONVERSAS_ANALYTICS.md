# 🤖 Sistema de Análise de Conversas IA - ASSISMAX

## 📊 **Visão Geral**

O sistema de análise de conversas foi implementado para capturar, armazenar e analisar todas as interações dos clientes com o chatbot IA da ASSISMAX. Isso permite insights estratégicos valiosos para melhorar o atendimento e identificar oportunidades de negócio.

## 🎯 **Funcionalidades Implementadas**

### **1. Logging Automático de Conversas**
- ✅ **Captura automática**: Todas as conversas do chatbot são salvas na tabela `conversas_ia`
- ✅ **Contexto rico**: Salva nome do lead, produtos mencionados, estágio da conversa
- ✅ **Fallback tracking**: Registra quando a API falha e usa respostas de fallback
- ✅ **Metadados**: API usada, número de produtos disponíveis, histórico da conversa

### **2. Dashboard de Analytics**
- ✅ **Métricas principais**: Total de conversas, taxa de qualificação, coleta de dados
- ✅ **Produtos mais perguntados**: Ranking dos produtos que geram mais interesse
- ✅ **Dúvidas frequentes**: Categorização automática das perguntas (preços, entrega, etc.)
- ✅ **Horários de pico**: Identificação dos melhores horários para atendimento
- ✅ **Palavras-chave**: Termos mais usados pelos clientes
- ✅ **Conversas detalhadas**: Visualização das últimas conversas

### **3. Filtros e Períodos**
- ✅ **Filtros temporais**: Hoje, Semana, Mês, Todos
- ✅ **Atualização automática**: Dados atualizados a cada 5 minutos
- ✅ **Visualização responsiva**: Funciona em desktop e mobile

## 🔧 **Como Funciona**

### **Fluxo de Captura**
```
Cliente → Chatbot → IA (DeepSeek) → Resposta → Salvar na DB
                 ↓
            Contexto extraído:
            - Nome do lead
            - Produtos mencionados
            - Estágio da conversa
            - Metadados técnicos
```

### **Estrutura da Tabela `conversas_ia`**
```sql
CREATE TABLE conversas_ia (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  mensagem TEXT NOT NULL,
  resposta TEXT NOT NULL,
  contexto JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Exemplo de Contexto Salvo**
```json
{
  "stage": "collecting_name",
  "nome_lead": "João",
  "telefone_lead": "(11) 99999-9999",
  "produtos_mencionados": ["arroz", "Arroz Tipo 1 - 5kg"],
  "api_used": "deepseek",
  "produtos_disponiveis": 55,
  "conversation_history_length": 3
}
```

## 📈 **Métricas Disponíveis**

### **1. Métricas de Volume**
- **Total de conversas** no período selecionado
- **Conversas hoje** vs **conversas da semana**
- **Distribuição por horário** (horários de pico)

### **2. Métricas de Qualificação**
- **Taxa de qualificação**: % de conversas que chegaram ao modo vendas
- **Taxa de coleta de nome**: % de conversas que coletaram nome
- **Taxa de coleta de telefone**: % de conversas que coletaram telefone

### **3. Análise de Produtos**
- **Produtos mais perguntados**: Ranking por número de menções
- **Categorias de interesse**: Alimentos, Bebidas, Limpeza, etc.
- **Produtos que geram mais economia**: Diferença atacado vs varejo

### **4. Análise de Dúvidas**
- **Categorização automática**:
  - 💰 **Preços**: "quanto custa", "valor", "preço"
  - 🚚 **Entrega**: "entregam", "frete", "envio"
  - 📦 **Disponibilidade**: "têm", "produto", "estoque"
  - 🏪 **Atacado**: "atacado", "quantidade", "desconto"
  - ⭐ **Qualidade**: "qualidade", "marca", "bom"
  - 💳 **Pagamento**: "pagamento", "forma", "cartão"

### **5. Palavras-Chave**
- **Termos mais frequentes** nas conversas
- **Filtro de palavras comuns** (para, com, que, etc.)
- **Insights sobre linguagem** dos clientes

## 🎛️ **Como Acessar**

### **No Dashboard Administrativo**
1. Acesse `/admin` (login necessário)
2. Clique na aba **"Conversas IA"**
3. Explore as diferentes seções:
   - **Visão Geral**: Métricas principais
   - **Produtos**: Produtos mais perguntados
   - **Dúvidas**: Categorias de perguntas
   - **Engajamento**: Palavras-chave e métricas

### **Página de Teste (Desenvolvimento)**
- Acesse `/test-conversas` para ver o dashboard isolado
- Útil para desenvolvimento e testes

## 💡 **Insights Estratégicos**

### **1. Otimização do Chatbot**
- **Produtos populares**: Priorizar informações dos produtos mais perguntados
- **Dúvidas frequentes**: Criar respostas mais detalhadas para categorias comuns
- **Horários de pico**: Ajustar disponibilidade da equipe

### **2. Estratégia de Vendas**
- **Produtos de entrada**: Usar produtos mais perguntados como "isca"
- **Cross-selling**: Sugerir produtos relacionados aos mais populares
- **Preços competitivos**: Focar na economia do atacado vs varejo

### **3. Melhoria do Atendimento**
- **Qualificação**: Melhorar taxa de coleta de dados pessoais
- **Handoff**: Otimizar momento de transferência para humanos
- **Personalização**: Usar histórico para atendimento personalizado

## 🔄 **Próximas Melhorias**

### **Curto Prazo**
- [ ] **Exportação de dados**: CSV/Excel dos analytics
- [ ] **Alertas**: Notificações para picos de conversa ou produtos em alta
- [ ] **Comparação temporal**: Comparar períodos (semana atual vs anterior)

### **Médio Prazo**
- [ ] **Análise de sentimento**: Detectar satisfação/insatisfação
- [ ] **Funil de conversão**: Acompanhar jornada completa lead → venda
- [ ] **A/B Testing**: Testar diferentes respostas do chatbot

### **Longo Prazo**
- [ ] **Machine Learning**: Predição de produtos de interesse
- [ ] **Recomendações automáticas**: Sugestões baseadas em histórico
- [ ] **Integração CRM**: Conectar com sistemas de vendas

## 🚀 **Como Usar os Dados**

### **Reuniões Semanais**
1. **Revisar métricas** da semana anterior
2. **Identificar produtos em alta** para ajustar estoque
3. **Analisar dúvidas frequentes** para melhorar FAQ
4. **Planejar campanhas** baseadas em interesse dos clientes

### **Otimização Contínua**
1. **Monitorar taxa de qualificação** semanalmente
2. **Ajustar respostas** do chatbot baseado em dúvidas frequentes
3. **Treinar equipe** sobre produtos mais perguntados
4. **Criar conteúdo** para dúvidas recorrentes

---

## 📞 **Suporte**

Para dúvidas sobre o sistema de analytics:
- Verificar logs no console do navegador
- Consultar documentação técnica em `/src/hooks/useConversasAnalytics.ts`
- Testar funcionalidades em `/test-conversas`

**Sistema implementado com sucesso! 🎉**
