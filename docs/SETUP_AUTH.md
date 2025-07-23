# Guia de Configuração de Autenticação - ASSISMAX

## 🔐 Sistema de Autenticação Implementado

O sistema agora possui autenticação completa com controle de acesso baseado em níveis (admin/funcionário).

## ✅ O que foi implementado

### 1. **Infraestrutura de Autenticação**
- **AuthContext** - Gerenciamento centralizado de estado de autenticação
- **ProtectedRoute** - Componente para proteger rotas privadas
- **Login Page** - Página dedicada de login em `/login`
- **Integração Supabase Auth** - Autenticação com email/senha

### 2. **Proteção de Rotas**
- `/admin` - Apenas administradores podem acessar
- `/funcionarios` - Funcionários e administradores podem acessar
- Redirecionamento automático para login quando não autenticado

### 3. **Gestão de Funcionários**
- Interface completa para criar/editar/desativar funcionários
- Disponível na aba "Funcionários" do painel admin
- Níveis de acesso: Admin e Funcionário

### 4. **Row Level Security (RLS)**
- Funcionários só veem leads atribuídos a eles
- Admins veem todos os leads da empresa
- Políticas de segurança implementadas no banco

## 🚀 Como Configurar Usuários de Teste

### Passo 1: Aplicar a Migration de Autenticação

```bash
# Na pasta do projeto
cd supabase
npx supabase db push
```

Ou aplique manualmente no Supabase Dashboard:
1. Vá para SQL Editor
2. Cole o conteúdo de `supabase/migrations/20250121_auth_setup.sql`
3. Execute

### Passo 2: Criar Usuários no Supabase Auth

#### Opção A: Usar os usuários de teste da migration
A migration já cria dois usuários de teste:
- **Admin**: admin@assismax.com.br / admin123
- **Funcionário**: funcionario@assismax.com.br / func123

⚠️ **IMPORTANTE**: Mude as senhas em produção!

#### Opção B: Criar usuários manualmente (RECOMENDADO)

1. Acesse o Supabase Dashboard
2. Vá para **Authentication** > **Users**
3. Clique em **Invite user**
4. Preencha o email do funcionário
5. Após criar o usuário no Auth, crie o registro na tabela `funcionarios`:

```sql
-- Criar funcionário admin
INSERT INTO funcionarios (nome, email, telefone, nivel_acesso, empresa_id, ativo)
VALUES (
  'Nome do Admin',
  'admin@suaempresa.com.br',
  '(61) 99999-9999',
  'admin',
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  true
);

-- Criar funcionário comum
INSERT INTO funcionarios (nome, email, telefone, nivel_acesso, empresa_id, ativo)
VALUES (
  'Nome do Funcionário',
  'funcionario@suaempresa.com.br',
  '(61) 98888-8888',
  'funcionario',
  (SELECT id FROM empresas WHERE slug = 'assismax'),
  true
);
```

### Passo 3: Configurar Variáveis de Ambiente

Certifique-se de que as variáveis estão corretas no `.env`:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## 📱 Como Usar o Sistema

### Para Administradores
1. Acesse `/login` ou `/admin`
2. Entre com credenciais de admin
3. Acesso completo a:
   - Dashboard com todas as métricas
   - Gestão de todos os leads
   - Gestão de funcionários
   - Analytics

### Para Funcionários
1. Acesse `/login` ou `/funcionarios`
2. Entre com credenciais de funcionário
3. Acesso restrito a:
   - Apenas seus próprios leads
   - Dashboard simplificado
   - Métricas pessoais

## 🔧 Gestão de Funcionários (Admin)

No painel administrativo, aba "Funcionários":

1. **Criar Funcionário**
   - Nome completo
   - Email (será usado para login)
   - Senha (mínimo 6 caracteres)
   - Telefone (opcional)
   - Nível de acesso

2. **Editar Funcionário**
   - Atualizar informações (exceto email)
   - Alterar nível de acesso

3. **Ativar/Desativar**
   - Bloquear acesso temporariamente
   - Reativar quando necessário

## 🛡️ Segurança

### Políticas Implementadas
- **Autenticação obrigatória** para dashboards
- **Separação por níveis** de acesso
- **RLS no banco** - Isolamento de dados
- **Audit logs** - Rastreamento de ações
- **Sessões seguras** - Renovação automática

### Boas Práticas
1. **Senhas fortes** - Mínimo 8 caracteres, com números e símbolos
2. **Emails únicos** - Cada funcionário com email próprio
3. **Desativar ex-funcionários** - Não deletar, apenas desativar
4. **Revisar acessos** - Periodicamente verificar níveis

## 🐛 Troubleshooting

### "Usuário não encontrado ou inativo"
- Verifique se o funcionário existe na tabela `funcionarios`
- Confirme que `ativo = true`
- Email deve ser idêntico ao cadastrado no Auth

### "Email ou senha incorretos"
- Confirme credenciais no Supabase Auth
- Reset de senha: Supabase Dashboard > Authentication > Users

### "Acesso Negado" 
- Funcionário tentando acessar área admin
- Verifique `nivel_acesso` na tabela `funcionarios`

### Leads não aparecem
- Confirme que funcionário está na empresa correta
- Para funcionários: leads devem estar atribuídos a eles
- Para admins: deve aparecer todos da empresa

## 📝 Próximos Passos

1. **Configurar email** para recuperação de senha
2. **2FA** - Autenticação de dois fatores
3. **Logs detalhados** - Auditoria completa
4. **Integração SSO** - Login único corporativo

## ⚠️ Importante para Produção

1. **Remover usuários de teste** da migration
2. **Usar senhas fortes** e únicas
3. **Configurar SMTP** para emails
4. **Backup regular** do banco
5. **Monitorar tentativas** de login

---

## Comandos Úteis

```bash
# Ver logs de autenticação
SELECT * FROM audit_logs WHERE tabela = 'auth.users' ORDER BY timestamp DESC;

# Listar todos os funcionários
SELECT * FROM funcionarios ORDER BY created_at DESC;

# Verificar leads por funcionário
SELECT f.nome, COUNT(l.id) as total_leads
FROM funcionarios f
LEFT JOIN leads l ON l.funcionario_id = f.id
GROUP BY f.id, f.nome;
```

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique os logs do Supabase
2. Consulte a documentação do Supabase Auth
3. Entre em contato com o desenvolvedor