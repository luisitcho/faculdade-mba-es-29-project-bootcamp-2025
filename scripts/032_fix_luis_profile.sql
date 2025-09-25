-- Script específico para corrigir o perfil do luishenrisc1@gmail.com
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário existe na auth.users
SELECT 
    'Usuário luishenrisc1@gmail.com na auth.users:' as status,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'luishenrisc1@gmail.com';

-- 2. Verificar se o usuário tem perfil
SELECT 
    'Perfil do luishenrisc1@gmail.com:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';

-- 3. Deletar perfil existente se houver
DELETE FROM public.profiles WHERE email = 'luishenrisc1@gmail.com';

-- 4. Criar perfil correto para luishenrisc1@gmail.com
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Admin Luis',
    'luishenrisc1@gmail.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'luishenrisc1@gmail.com';

-- 5. Verificar se foi criado corretamente
SELECT 
    'Perfil criado com sucesso:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';

-- 6. Testar a consulta exata que o sistema usa
-- (Substitua 'ID_DO_LUIS' pelo ID real do usuário)
SELECT 
    'Teste da consulta do sistema:' as status,
    'Execute esta consulta com o ID do luis:' as info,
    'SELECT * FROM public.profiles WHERE id = ''ID_DO_LUIS'';' as consulta_teste;

-- 7. Mostrar o ID do usuário para teste
SELECT 
    'ID do usuário luishenrisc1@gmail.com:' as info,
    id as user_id
FROM auth.users 
WHERE email = 'luishenrisc1@gmail.com';
