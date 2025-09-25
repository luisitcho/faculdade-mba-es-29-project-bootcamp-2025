-- Script SIMPLES para atualizar usuários existentes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o que temos atualmente
SELECT 
    'Estado atual da tabela profiles:' as status,
    COUNT(*) as total_usuarios
FROM public.profiles;

-- 2. Verificar se temos os usuários admin
SELECT 
    'Usuários admin atuais:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 3. Atualizar usuário admin@admin.com (se existir)
UPDATE public.profiles 
SET 
    nome = 'Administrador',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW()
WHERE email = 'admin@admin.com';

-- 4. Atualizar usuário luishenrisc1@gmail.com (se existir)
UPDATE public.profiles 
SET 
    nome = 'Admin Luis',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW()
WHERE email = 'luishenrisc1@gmail.com';

-- 5. Se não existirem, criar apenas os perfis (sem mexer na auth.users)
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Administrador',
    'admin@admin.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'admin@admin.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.email = 'admin@admin.com')
ON CONFLICT (id) DO UPDATE SET
    nome = 'Administrador',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW();

INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Admin Luis',
    'luishenrisc1@gmail.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'luishenrisc1@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.email = 'luishenrisc1@gmail.com')
ON CONFLICT (id) DO UPDATE SET
    nome = 'Admin Luis',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW();

-- 6. Verificar resultado final
SELECT 
    'Resultado final:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 7. Mostrar todos os usuários
SELECT 
    'Todos os usuários:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;
