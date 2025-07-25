# 🚀 NOVO FLUXO N8N COM SUPABASE - ASSISMAX

## ✅ FLUXO CRIADO: `assismax-com-supabase.json`

### 📋 **ESTRUTURA DO FLUXO ATUALIZADO:**

```
Webhook → Edit Fields → [Google Sheets + Supabase] → Gmail
```

### 🔧 **ALTERAÇÕES REALIZADAS:**

#### 1. **✅ NÓS MANTIDOS (INTACTOS):**
- **Webhook** - Recebe dados do chatbot
- **Edit Fields** - Processa e formata dados  
- **Google Sheets** - Salva na planilha (mantido)
- **Gmail** - Envia email de notificação (mantido)

#### 2. **🆕 NÓ ADICIONADO:**
- **Supabase - Salvar Lead** - Insere dados na tabela `leads`

#### 3. **📊 MAPEAMENTO DE CAMPOS SUPABASE:**
```json
{
  "empresa_id": "{{ $json.empresa_id }}", // Campo obrigatório
  "nome": "{{ $json.nome }}",             // Campo obrigatório  
  "telefone": "{{ $json.telefone }}",     // Campo obrigatório
  "email": "{{ $json.email }}",           // Campo obrigatório
  "origem": "{{ $json.origem }}",         // Origem do lead
  "status": "{{ $json.status }}",         // Status (novo)
  "observacoes": "Lead capturado via chatbot em {{ $json.data }}",
  "dados_adicionais": "JSON com data_captura e origem_detalhada"
}
```

### ⚙️ **CONFIGURAÇÃO NECESSÁRIA NO N8N:**

#### 1. **Credenciais Supabase:**
```
Nome: Supabase AssisMax
URL: https://rsydniuoipecgsocsuim.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeWRuaXVvaXBlY2dzb2NzdWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA0MDE3OCwiZXhwIjoyMDY4NjE2MTc4fQ.KOJCdyb9GHtlfAF5AxBDeDA8p6MN2znHayWVNUlYOYU
```

#### 2. **Importar Fluxo:**
1. Acesse N8N: https://assismax.app.n8n.cloud
2. Clique em "Import from File"
3. Selecione: `n8n/assismax-com-supabase.json`
4. Configure credenciais Supabase
5. Ative o fluxo

### 🎯 **RESULTADO ESPERADO:**

Quando um lead for capturado no chatbot:

✅ **Google Sheets** - Dados salvos na planilha (como antes)  
✅ **Supabase** - Dados salvos na tabela `leads` (NOVO!)  
✅ **Gmail** - Email de notificação enviado (como antes)

### 🔍 **VERIFICAÇÃO:**

Após importar e ativar o fluxo:
1. Teste o chatbot na landing page
2. Verifique se dados aparecem no Google Sheets
3. **NOVO:** Verifique se dados aparecem na tabela `leads` do Supabase
4. Confirme recebimento do email

---

**🎉 PROBLEMA RESOLVIDO!** 
Agora os leads serão salvos tanto no Google Sheets quanto no Supabase! 🚀