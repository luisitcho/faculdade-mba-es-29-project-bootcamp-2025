# 🔧 Guia para Corrigir a Base de Dados

## Problema Identificado
- A tabela `profiles` não tem a coluna `perfil_acesso`
- Os nomes dos usuários não estão sendo salvos corretamente
- Apenas `admin@admin.com` e `luishenrisc1@gmail.com` devem ter cargo "admin"
- Todos os outros usuários devem ter cargo "consulta" por padrão

## Solução Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para o seu projeto no Supabase
- Acesse a seção "SQL Editor"

### 2. Execute os Scripts na Ordem Correta

#### **Script 1: Corrigir Estrutura da Base de Dados**
```sql
-- Execute o script 018_fix_database_structure.sql
-- Este script:
-- - Recria a tabela profiles com estrutura correta
-- - Adiciona a coluna perfil_acesso
-- - Cria as políticas RLS
-- - Cria o trigger para novos usuários
-- - Cria os usuários admin principais
```

#### **Script 2: Migrar Usuários Existentes**
```sql
-- Execute o script 019_migrate_existing_users.sql
-- Este script:
-- - Migra usuários existentes para a nova estrutura
-- - Define perfil_acesso = 'consulta' para usuários normais
-- - Define perfil_acesso = 'admin' para os admins principais
-- - Corrige nomes vazios ou nulos
```

#### **Script 3: Verificar Resultado**
```sql
-- Execute o script 020_verify_database.sql
-- Este script:
-- - Verifica se a estrutura está correta
-- - Mostra estatísticas dos usuários
-- - Confirma que os admins estão corretos
```

### 3. Verificação Final

Após executar os scripts, você deve ver:

#### **Estrutura da Tabela:**
- `id` (UUID, Primary Key)
- `nome` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `perfil_acesso` (TEXT, NOT NULL, CHECK constraint)
- `ativo` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### **Usuários Admin Principais:**
- `admin@admin.com` - Nome: "Administrador", Cargo: "admin"
- `luishenrisc1@gmail.com` - Nome: "Admin Luis", Cargo: "admin"

#### **Outros Usuários:**
- Todos com cargo "consulta" por padrão
- Nomes corretos salvos do cadastro

### 4. Teste o Sistema

1. **Faça login com admin@admin.com / admin123**
2. **Verifique se aparece "Administrador" na sidebar**
3. **Acesse a aba "Usuários" no dashboard**
4. **Teste o gerenciamento de usuários na sidebar**

### 5. Se Algo Der Errado

Se houver problemas, execute este script de limpeza:

```sql
-- CUIDADO: Este script apaga todos os dados de usuários
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

Depois execute novamente os scripts 018, 019 e 020.

## Resultado Esperado

✅ Tabela `profiles` com estrutura correta  
✅ Coluna `perfil_acesso` funcionando  
✅ Nomes dos usuários salvos corretamente  
✅ Admins principais com cargo "admin"  
✅ Outros usuários com cargo "consulta"  
✅ Sidebar mostrando nomes e cargos corretos  
✅ Gerenciamento de usuários funcionando  

## Próximos Passos

Após corrigir a base de dados:
1. Teste o cadastro de novos usuários
2. Verifique se os nomes são salvos corretamente
3. Confirme que a sidebar mostra os dados corretos
4. Teste o gerenciamento de usuários
