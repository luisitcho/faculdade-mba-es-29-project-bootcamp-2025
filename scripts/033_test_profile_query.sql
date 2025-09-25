-- Script para testar a consulta exata que o sistema usa
-- Execute este script no SQL Editor do Supabase

-- 1. Pegar o ID do usuário luishenrisc1@gmail.com
SELECT 
    'ID do usuário luishenrisc1@gmail.com:' as info,
    id as user_id,
    email
FROM auth.users 
WHERE email = 'luishenrisc1@gmail.com';

-- 2. Testar a consulta exata que o sistema usa
-- (Substitua o ID abaixo pelo ID real do usuário)
SELECT 
    'Teste da consulta do sistema:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'luishenrisc1@gmail.com'
);

-- 3. Verificar se a consulta retorna dados
SELECT 
    'Resultado da consulta:' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (SELECT id FROM auth.users WHERE email = 'luishenrisc1@gmail.com')
        ) THEN '✅ PERFIL ENCONTRADO'
        ELSE '❌ PERFIL NÃO ENCONTRADO'
    END as resultado;

-- 4. Mostrar todos os perfis para comparação
SELECT 
    'Todos os perfis existentes:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
ORDER BY created_at DESC;
