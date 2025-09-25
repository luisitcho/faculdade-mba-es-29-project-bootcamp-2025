# 🎯 Guia Visual - Como Resolver no Supabase

## **Passo 1: Acessar o Supabase Dashboard**

1. **Vá para:** [https://supabase.com](https://supabase.com)
2. **Faça login** na sua conta
3. **Selecione o seu projeto** (o que você está usando para este sistema)

## **Passo 2: Verificar Tabelas Existentes**

### **No menu lateral esquerdo:**
- Clique em **"Table Editor"** 📊
- Você verá uma lista de tabelas
- **Se NÃO aparecer a tabela `profiles`**, ela não foi criada

### **O que você deve ver:**
- `auth.users` (tabela do sistema)
- `auth.sessions` (tabela do sistema)
- **NÃO deve ter `profiles`** ❌

## **Passo 3: Criar a Tabela Profiles**

### **No menu lateral esquerdo:**
- Clique em **"SQL Editor"** 📝
- Clique em **"New Query"**
- **Cole o script `021_simple_fix.sql`** (todo o conteúdo)
- Clique em **"Run"** ▶️

### **O que deve acontecer:**
- ✅ Tabela `profiles` criada
- ✅ Colunas: `id`, `nome`, `email`, `perfil_acesso`, `ativo`, `created_at`, `updated_at`
- ✅ Políticas RLS criadas
- ✅ Trigger criado

## **Passo 4: Criar Usuários Admin**

### **No SQL Editor:**
- Clique em **"New Query"**
- **Cole o script `022_create_admin_users.sql`** (todo o conteúdo)
- Clique em **"Run"** ▶️

### **O que deve acontecer:**
- ✅ Usuário `admin@admin.com` criado (senha: `admin123`)
- ✅ Usuário `luishenrisc1@gmail.com` criado (senha: `123456`)
- ✅ Ambos com cargo "admin"

## **Passo 5: Verificar se Funcionou**

### **Volte para "Table Editor":**
- Agora deve aparecer a tabela **`profiles`** ✅
- Clique na tabela `profiles`
- Você deve ver os 2 usuários admin

### **Teste no Sistema:**
1. **Faça login** com `admin@admin.com` / `admin123`
2. **Verifique se aparece "Administrador"** na sidebar
3. **Acesse a aba "Usuários"** no dashboard

## **Passo 6: Se Algo Der Errado**

### **Erro: "Table already exists"**
- Ignore o erro, continue com o próximo script

### **Erro: "Permission denied"**
- Verifique se você tem permissão de administrador no projeto

### **Erro: "Column does not exist"**
- Execute o script `021_simple_fix.sql` novamente

## **Estrutura Final Esperada**

### **Tabela `profiles`:**
```
id (UUID) - Chave primária
nome (TEXT) - Nome do usuário
email (TEXT) - Email do usuário  
perfil_acesso (TEXT) - Cargo: admin, operador, consulta
ativo (BOOLEAN) - Se o usuário está ativo
created_at (TIMESTAMP) - Data de criação
updated_at (TIMESTAMP) - Data de atualização
```

### **Usuários Admin:**
- `admin@admin.com` → Nome: "Administrador", Cargo: "admin"
- `luishenrisc1@gmail.com` → Nome: "Admin Luis", Cargo: "admin"

## **Próximos Passos**

Após executar os scripts:
1. ✅ Teste o login
2. ✅ Verifique a sidebar
3. ✅ Teste o gerenciamento de usuários
4. ✅ Cadastre um novo usuário para testar

## **Se Precisar de Ajuda**

Se algo não funcionar:
1. **Tire print** da tela do Supabase
2. **Copie a mensagem de erro** exata
3. **Me envie** para eu te ajudar
