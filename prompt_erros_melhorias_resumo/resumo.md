# PROBLEMAS CRÍTICOS NO SISTEMA ASSISMAX - RESUMO COMPLETO

## 🚨 PROBLEMA 1: Loop Infinito na Autenticação (CRÍTICO - ATUAL)

### Descrição
O sistema entra em loop infinito após o login. O usuário digita as credenciais corretas, o formulário é submetido, mas o processo trava sem erros e sem redirecionamento.

### Sintomas
- Formulário de login é submetido
- Logs param em "Chamando signIn..."
- Nenhum erro é mostrado
- Nenhum redirecionamento acontece
- Sistema fica travado indefinidamente

### Logs do Console
```
Login.tsx:42 => Form submit para: ottof6@gmail.com
Login.tsx:47 => Chamando signIn...
[PARA AQUI - SEM MAIS LOGS]
```

### Tentativas de Correção que FALHARAM (2 dias de trabalho)
1. **SimpleAuthContext criado** - Problema persistiu
2. **AuthContext refatorado múltiplas vezes** - Sem sucesso
3. **Hooks useAuth alterados** - Loop continua
4. **useCallback e proteções contra re-render** - Não resolveu
5. **Redirecionamento manual no onAuthStateChange** - Não funciona

### Código Atual Problemático
```typescript
// AuthContext.tsx - signIn simplificado mas ainda com loop
const signIn = async (email: string, password: string) => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Redirecionamento deveria acontecer no onAuthStateChange mas não acontece
    return data;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### Impacto
- **Sistema 100% inutiliz�vel** - Ningu�m consegue entrar
- **Dashboards inacess�veis** - Admin e funcion�rios bloqueados
- **Gest�o imposs�vel** - N�o h� como gerenciar leads ou funcion�rios

---

## =� PROBLEMA 2: Leads N�o Aparecem no Dashboard

### Descri��o
Mesmo com dados confirmados no banco, os leads n�o s�o renderizados na interface do dashboard.

### Dados Confirmados via SQL Direto
```sql
-- Leads existem
SELECT COUNT(*) FROM leads; -- Retorna: 2

-- Leads com detalhes
SELECT * FROM leads;
-- ID: 43873200-f60f-4ce5-90b2-89015a18e306 - Odtwin Fritsche
-- ID: 034474f7-ea5f-4a94-8cb9-a55d88e90e0e - Carlos Santos

-- Empresa existe
SELECT * FROM empresas WHERE ativo = true;
-- ID: 231f795a-b14c-438b-a896-2f2e479cfa02 - ASSISMAX Atacarejo
```

### Problema no Hook
```typescript
// useDashboard.ts - Query n�o retorna dados
const { data: empresa } = await supabase
  .from('empresas')
  .select('id')
  .eq('ativo', true)
  .single();
// empresa retorna null ou erro, causando falha em cascata
```

### Tentativas de Corre��o
1. **useSimpleDashboard criado** - Query direta com ID fixo
2. **Empresa ID hardcoded** - Ainda n�o funciona
3. **M�ltiplos console.logs** - Queries executam mas dados n�o chegam
4. **Refatora��o completa dos hooks** - Problema persiste

---

## =� PROBLEMA 3: Cria��o de Funcion�rios Quebrada

### Descri��o
Modal de cria��o de funcion�rio cria usu�rio no Supabase Auth mas falha ao inserir na tabela funcionarios.

### Fluxo Atual (Quebrado)
1.  Admin clica em "Criar Funcion�rio"
2.  Preenche form com nome, email, senha, telefone
3.  Usu�rio criado em auth.users
4. L Insert na tabela funcionarios falha
5. L Usu�rio fica �rf�o (existe no Auth mas n�o como funcion�rio)

### Erro RLS
```
code: 42501
message: new row violates row-level security policy for table "funcionarios"
```

### Dados de Teste
- **Admin**: ottof6@gmail.com (Otto Fritsche) - Funciona
- **Tentando criar**: priscilla.sarmentof@gmail.com - Falha

---

## =� RESUMO DO ESTADO ATUAL

### Funcionalidades Quebradas
1. L **Login** - Loop infinito
2. L **Dashboard** - N�o mostra leads mesmo com dados no banco
3. L **Criar Funcion�rios** - RLS bloqueia inser��o
4. L **Gest�o de Leads** - Inacess�vel devido ao login quebrado

### Funcionalidades que Deveriam Funcionar
1.  Banco de dados configurado corretamente
2.  2 leads existem na tabela
3.  1 empresa ativa (ASSISMAX)
4.  2 funcion�rios cadastrados (Otto admin + Ana funcion�ria)

### Tempo Perdido
- **2 dias completos** tentando resolver autentica��o
- **M�ltiplas refatora��es** sem sucesso
- **C�digo cada vez mais complexo** sem resolver o problema base

---

## <� SUGEST�O: COME�AR DO ZERO

### Por que recome�ar?
1. **C�digo muito modificado** - Dif�cil rastrear todos os problemas
2. **M�ltiplas tentativas falhadas** - Acumulou complexidade desnecess�ria
3. **Problemas em cascata** - Um erro leva a outro

### Abordagem Sugerida
1. **Template funcional** - Usar um boilerplate de auth que j� funciona
2. **Implementa��o incremental** - Uma feature por vez
3. **Testes a cada passo** - Garantir que cada parte funciona
4. **Simplicidade primeiro** - Sem logs complexos ou features extras

---

## =� CONTEXTO T�CNICO

### Ambiente
- **Frontend**: React + TypeScript + Vite (localhost:8080)
- **Backend**: Supabase (projeto: rsydniuoipecgsocsuim)
- **Database**: PostgreSQL com RLS ativo
- **Auth**: Supabase Auth

### Arquivos Principais Problem�ticos
- `/src/contexts/AuthContext.tsx` - Loop infinito
- `/src/hooks/useDashboard.ts` - N�o busca dados
- `/src/components/admin/CreateFuncionarioModal.tsx` - RLS bloqueando

### Status
**SISTEMA COMPLETAMENTE INOPERANTE** - Requer solu��o urgente ou reconstru��o completa.