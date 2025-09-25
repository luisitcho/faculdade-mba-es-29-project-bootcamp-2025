-- Script para debugar o problema do profile null
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuários na auth.users
SELECT 
    'Usuários na auth.users:' as status,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Verificar usuários na tabela profiles
SELECT 
    'Usuários na tabela profiles:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 3. Verificar se há usuários órfãos (existem em auth.users mas não em profiles)
SELECT 
    'Usuários órfãos (existem em auth.users mas não em profiles):' as status,
    u.id,
    u.email,
    u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. Verificar se há usuários órfãos (existem em profiles mas não em auth.users)
SELECT 
    'Usuários órfãos (existem em profiles mas não em auth.users):' as status,
    p.id,
    p.nome,
    p.email,
    p.perfil_acesso
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 5. Criar perfis para usuários órfãos
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data ->> 'nome'), ''),
        'Usuário ' || SUBSTRING(u.email, 1, POSITION('@' IN u.email) - 1)
    ),
    u.email,
    CASE 
        WHEN u.email = 'admin@admin.com' THEN 'admin'
        WHEN u.email = 'luishenrisc1@gmail.com' THEN 'admin'
        ELSE 'consulta'
    END,
    true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 6. Verificar resultado final
SELECT 
    'Resultado final - todos os usuários:' as status,
    u.id as auth_id,
    u.email as auth_email,
    p.id as profile_id,
    p.nome as profile_nome,
    p.perfil_acesso as profile_cargo,
    p.ativo as profile_ativo
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 7. Verificar se o trigger está funcionando
SELECT 
    'Trigger status:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';
