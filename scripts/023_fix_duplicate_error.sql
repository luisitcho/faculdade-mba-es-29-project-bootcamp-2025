-- Script para corrigir o erro de chave duplicada
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuários existentes
SELECT 
    'Usuários existentes na tabela profiles:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 2. Verificar usuários na auth.users
SELECT 
    'Usuários na auth.users:' as status,
    id,
    email,
    email_confirmed_at
FROM auth.users 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 3. Atualizar usuários existentes em vez de criar novos
UPDATE public.profiles 
SET 
    nome = 'Administrador',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW()
WHERE email = 'admin@admin.com';

UPDATE public.profiles 
SET 
    nome = 'Admin Luis',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW()
WHERE email = 'luishenrisc1@gmail.com';

-- 4. Se não existir na tabela profiles, criar
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Administrador',
    'admin@admin.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'admin@admin.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Admin Luis',
    'luishenrisc1@gmail.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'luishenrisc1@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- 5. Verificar resultado final
SELECT 
    'Usuários admin após correção:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at,
    updated_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 6. Verificar se a estrutura da tabela está correta
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
