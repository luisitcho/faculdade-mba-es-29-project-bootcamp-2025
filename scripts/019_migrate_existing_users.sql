-- Script para migrar usuários existentes para a nova estrutura
-- Execute APÓS o script 018_fix_database_structure.sql

-- 1. Verificar se existem usuários na auth.users que não têm perfil
SELECT 
    'Usuários sem perfil:' as status,
    COUNT(*) as total
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. Criar perfis para usuários existentes que não têm perfil
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data ->> 'nome'), ''),
        NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
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

-- 3. Atualizar perfis existentes para garantir que tenham os dados corretos
UPDATE public.profiles 
SET 
    nome = COALESCE(
        NULLIF(TRIM(nome), ''),
        'Usuário ' || SUBSTRING(email, 1, POSITION('@' IN email) - 1)
    ),
    perfil_acesso = CASE 
        WHEN email = 'admin@admin.com' THEN 'admin'
        WHEN email = 'luishenrisc1@gmail.com' THEN 'admin'
        WHEN perfil_acesso IS NULL OR perfil_acesso = '' THEN 'consulta'
        ELSE perfil_acesso
    END,
    ativo = COALESCE(ativo, true),
    updated_at = NOW()
WHERE id IS NOT NULL;

-- 4. Verificar resultado final
SELECT 
    'Total de usuários migrados:' as status,
    COUNT(*) as total
FROM public.profiles;

-- 5. Mostrar todos os usuários com seus perfis
SELECT 
    'Usuários finais:' as info,
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

-- 6. Verificar se os admins principais estão corretos
SELECT 
    'Verificação dos admins:' as status,
    email,
    nome,
    perfil_acesso,
    CASE 
        WHEN email IN ('admin@admin.com', 'luishenrisc1@gmail.com') AND perfil_acesso = 'admin' THEN 'OK'
        ELSE 'ERRO'
    END as status_admin
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');
