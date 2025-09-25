-- Script para forçar a criação de perfil para TODOS os usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Deletar TODOS os perfis existentes para começar limpo
DELETE FROM public.profiles;

-- 2. Criar perfil para TODOS os usuários em auth.users
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'admin@admin.com' THEN 'Administrador'
        WHEN u.email = 'luishenrisc1@gmail.com' THEN 'Admin Luis'
        WHEN u.raw_user_meta_data ->> 'nome' IS NOT NULL THEN u.raw_user_meta_data ->> 'nome'
        WHEN u.raw_user_meta_data ->> 'name' IS NOT NULL THEN u.raw_user_meta_data ->> 'name'
        ELSE 'Usuário ' || SUBSTRING(u.email, 1, POSITION('@' IN u.email) - 1)
    END as nome,
    u.email,
    CASE 
        WHEN u.email = 'admin@admin.com' THEN 'admin'
        WHEN u.email = 'luishenrisc1@gmail.com' THEN 'admin'
        WHEN u.raw_user_meta_data ->> 'perfil_acesso' IS NOT NULL THEN u.raw_user_meta_data ->> 'perfil_acesso'
        ELSE 'consulta'
    END as perfil_acesso,
    true
FROM auth.users u;

-- 3. Verificar se todos os usuários agora têm perfil
SELECT 
    'Verificação - todos os usuários devem ter perfil:' as status,
    u.id,
    u.email,
    p.nome,
    p.perfil_acesso,
    p.ativo,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        ELSE '✅ COM PERFIL'
    END as status_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Mostrar os usuários admin específicos
SELECT 
    'Usuários admin principais:' as status,
    u.id,
    u.email,
    p.nome,
    p.perfil_acesso,
    p.ativo
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 5. Testar a consulta exata que o sistema usa
SELECT 
    'Teste da consulta do sistema:' as status,
    'Execute esta consulta com o ID do usuário logado:' as info;
