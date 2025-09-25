-- Script para alterar o nome do luishenrisc1@gmail.com para "Luis Henrique"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o nome atual
SELECT 
    'Nome atual do luishenrisc1@gmail.com:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    updated_at
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';

-- 2. Atualizar o nome para "Luis Henrique"
UPDATE public.profiles 
SET 
    nome = 'Luis Henrique',
    updated_at = NOW()
WHERE email = 'luishenrisc1@gmail.com';

-- 3. Verificar se foi atualizado corretamente
SELECT 
    'Nome atualizado com sucesso:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    updated_at
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';

-- 4. Verificar todos os usuários admin
SELECT 
    'Todos os usuários admin:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 5. Testar como será exibido na sidebar
SELECT 
    'Como será exibido na sidebar:' as info,
    email,
    nome as nome_exibido,
    CASE 
        WHEN perfil_acesso = 'admin' THEN 'Administrador'
        WHEN perfil_acesso = 'operador' THEN 'Operador'
        WHEN perfil_acesso = 'consulta' THEN 'Consulta'
        ELSE perfil_acesso
    END as cargo_exibido
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';
