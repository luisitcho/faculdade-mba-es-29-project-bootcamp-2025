-- Script para corrigir os cargos dos usuários admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o estado atual dos usuários admin
SELECT 
    'Estado atual dos usuários admin:' as status,
    u.id,
    u.email,
    p.nome,
    p.perfil_acesso,
    p.ativo,
    CASE 
        WHEN p.perfil_acesso = 'admin' THEN '✅ ADMIN'
        ELSE '❌ NÃO É ADMIN'
    END as status_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY u.email;

-- 2. Atualizar o cargo do admin@admin.com para 'admin'
UPDATE public.profiles 
SET 
    perfil_acesso = 'admin',
    nome = 'Administrador',
    ativo = true,
    updated_at = NOW()
WHERE email = 'admin@admin.com';

-- 3. Atualizar o cargo do luishenrisc1@gmail.com para 'admin'
UPDATE public.profiles 
SET 
    perfil_acesso = 'admin',
    nome = 'Admin Luis',
    ativo = true,
    updated_at = NOW()
WHERE email = 'luishenrisc1@gmail.com';

-- 4. Se não existirem os perfis, criar
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
    perfil_acesso = 'admin',
    nome = 'Administrador',
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
    perfil_acesso = 'admin',
    nome = 'Admin Luis',
    ativo = true,
    updated_at = NOW();

-- 5. Verificar se os cargos foram atualizados corretamente
SELECT 
    'Verificação final - usuários admin:' as status,
    u.id,
    u.email,
    p.nome,
    p.perfil_acesso,
    p.ativo,
    CASE 
        WHEN p.perfil_acesso = 'admin' THEN '✅ ADMIN CORRETO'
        ELSE '❌ AINDA NÃO É ADMIN'
    END as status_final
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY u.email;

-- 6. Mostrar todos os usuários para verificar
SELECT 
    'Todos os usuários:' as status,
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
