-- Script para listar o conteúdo de todas as tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. Listar todas as tabelas existentes
SELECT 
    'Tabelas existentes no banco:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- 2. Conteúdo da tabela auth.users
SELECT 
    'Conteúdo da tabela auth.users:' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Conteúdo da tabela public.profiles
SELECT 
    'Conteúdo da tabela public.profiles:' as info,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at,
    updated_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 4. Verificar se há usuários órfãos
SELECT 
    'Usuários órfãos (existem em auth.users mas não em profiles):' as info,
    u.id,
    u.email,
    u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 5. Verificar se há usuários órfãos (existem em profiles mas não em auth.users)
SELECT 
    'Usuários órfãos (existem em profiles mas não em auth.users):' as info,
    p.id,
    p.nome,
    p.email,
    p.perfil_acesso
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 6. Verificar políticas RLS da tabela profiles
SELECT 
    'Políticas RLS da tabela profiles:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 7. Verificar se a tabela notificacoes existe
SELECT 
    'Tabela notificacoes existe?' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes' AND table_schema = 'public') 
        THEN 'SIM' 
        ELSE 'NÃO' 
    END as existe;

-- 8. Se a tabela notificacoes existir, mostrar seu conteúdo
SELECT 
    'Conteúdo da tabela notificacoes:' as info,
    COUNT(*) as total_registros
FROM public.notificacoes
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes' AND table_schema = 'public');

-- 9. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura da tabela profiles:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
