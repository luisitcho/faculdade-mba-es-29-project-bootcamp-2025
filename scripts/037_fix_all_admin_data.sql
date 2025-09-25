-- Script para corrigir TODOS os dados dos usuários admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o estado atual
SELECT 
    'Estado atual dos usuários:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    updated_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 2. Deletar TODOS os perfis existentes para começar limpo
DELETE FROM public.profiles WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 3. Criar perfil correto para admin@admin.com
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Administrador',
    'admin@admin.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'admin@admin.com';

-- 4. Criar perfil correto para luishenrisc1@gmail.com
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Luis Henrique',
    'luishenrisc1@gmail.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'luishenrisc1@gmail.com';

-- 5. Verificar se foram criados corretamente
SELECT 
    'Verificação final - dados corretos:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 6. Testar a consulta exata que o sistema usa
SELECT 
    'Teste da consulta do sistema para admin@admin.com:' as info,
    id,
    nome,
    email,
    perfil_acesso,
    CASE 
        WHEN perfil_acesso = 'admin' THEN 'Administrador'
        WHEN perfil_acesso = 'operador' THEN 'Operador'
        WHEN perfil_acesso = 'consulta' THEN 'Consulta'
        ELSE perfil_acesso
    END as perfil_exibido,
    ativo
FROM public.profiles 
WHERE email = 'admin@admin.com';

SELECT 
    'Teste da consulta do sistema para luishenrisc1@gmail.com:' as info,
    id,
    nome,
    email,
    perfil_acesso,
    CASE 
        WHEN perfil_acesso = 'admin' THEN 'Administrador'
        WHEN perfil_acesso = 'operador' THEN 'Operador'
        WHEN perfil_acesso = 'consulta' THEN 'Consulta'
        ELSE perfil_acesso
    END as perfil_exibido,
    ativo
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';

-- 7. Verificar se há outros usuários que precisam ser corrigidos
SELECT 
    'Todos os usuários no sistema:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY 
    CASE perfil_acesso 
        WHEN 'admin' THEN 1 
        WHEN 'operador' THEN 2 
        WHEN 'consulta' THEN 3 
        ELSE 4 
    END,
    created_at DESC;
