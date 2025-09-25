-- Script de debug para verificar os cargos dos usuários admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados brutos na tabela profiles
SELECT 
    'Dados brutos na tabela profiles:' as info,
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

-- 2. Verificar se há espaços ou caracteres especiais no perfil_acesso
SELECT 
    'Verificação de caracteres no perfil_acesso:' as info,
    email,
    perfil_acesso,
    LENGTH(perfil_acesso) as tamanho,
    ASCII(perfil_acesso) as codigo_ascii,
    CASE 
        WHEN perfil_acesso = 'admin' THEN '✅ EXATO'
        WHEN TRIM(perfil_acesso) = 'admin' THEN '⚠️ COM ESPAÇOS'
        WHEN perfil_acesso ILIKE 'admin' THEN '⚠️ CASE SENSITIVE'
        ELSE '❌ DIFERENTE'
    END as status
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 3. Forçar atualização com TRIM para remover espaços
UPDATE public.profiles 
SET 
    perfil_acesso = TRIM(perfil_acesso),
    updated_at = NOW()
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 4. Forçar perfil_acesso para 'admin' exato
UPDATE public.profiles 
SET 
    perfil_acesso = 'admin',
    updated_at = NOW()
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 5. Verificar resultado final
SELECT 
    'Resultado final:' as info,
    email,
    nome,
    perfil_acesso,
    CASE 
        WHEN perfil_acesso = 'admin' THEN '✅ ADMIN CORRETO'
        ELSE '❌ AINDA NÃO É ADMIN'
    END as status,
    updated_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 6. Testar a consulta exata que o sistema usa
SELECT 
    'Teste da consulta do sistema:' as info,
    'admin@admin.com' as email_teste,
    id,
    nome,
    perfil_acesso,
    CASE 
        WHEN perfil_acesso = 'admin' THEN 'Administrador'
        WHEN perfil_acesso = 'operador' THEN 'Operador'
        WHEN perfil_acesso = 'consulta' THEN 'Consulta'
        ELSE perfil_acesso
    END as cargo_exibido
FROM public.profiles 
WHERE email = 'admin@admin.com';

SELECT 
    'Teste da consulta do sistema:' as info,
    'luishenrisc1@gmail.com' as email_teste,
    id,
    nome,
    perfil_acesso,
    CASE 
        WHEN perfil_acesso = 'admin' THEN 'Administrador'
        WHEN perfil_acesso = 'operador' THEN 'Operador'
        WHEN perfil_acesso = 'consulta' THEN 'Consulta'
        ELSE perfil_acesso
    END as cargo_exibido
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';
