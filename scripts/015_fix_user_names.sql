-- Script para corrigir nomes de usuários na tabela profiles
-- Este script verifica e corrige os dados dos usuários

-- 1. Verificar usuários existentes na tabela profiles
SELECT 
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 2. Verificar se há usuários na auth.users que não têm perfil correspondente
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data,
    p.nome as profile_nome,
    p.perfil_acesso
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Atualizar nomes dos usuários admin principais se necessário
UPDATE public.profiles 
SET nome = 'Administrador'
WHERE email = 'admin@admin.com' AND (nome IS NULL OR nome = 'Usuário');

UPDATE public.profiles 
SET nome = 'Admin Luis'
WHERE email = 'luishenrisc1@gmail.com' AND (nome IS NULL OR nome = 'Usuário');

-- 4. Criar perfis para usuários que existem em auth.users mas não em profiles
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data ->> 'nome', 'Usuário'),
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'perfil_acesso', 'consulta'),
    true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 5. Verificar resultado final
SELECT 
    'Usuários na tabela profiles:' as info,
    COUNT(*) as total
FROM public.profiles

UNION ALL

SELECT 
    'Usuários com nome válido:' as info,
    COUNT(*) as total
FROM public.profiles 
WHERE nome IS NOT NULL AND nome != 'Usuário' AND nome != '';

-- 6. Mostrar todos os usuários finais
SELECT 
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;
