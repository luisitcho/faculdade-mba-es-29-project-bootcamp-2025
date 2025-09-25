-- Script para criar os usuários admin principais
-- Execute APÓS o script 021_simple_fix.sql

-- 1. Deletar usuários admin existentes se houver
DELETE FROM public.profiles WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');
DELETE FROM auth.users WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 2. Criar usuário admin@admin.com
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"nome": "Administrador", "perfil_acesso": "admin"}'
);

-- 3. Criar usuário luishenrisc1@gmail.com
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'luishenrisc1@gmail.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"nome": "Admin Luis", "perfil_acesso": "admin"}'
);

-- 4. Criar perfis para os usuários admin
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Administrador',
    'admin@admin.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'admin@admin.com';

INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    'Admin Luis',
    'luishenrisc1@gmail.com',
    'admin',
    true
FROM auth.users u 
WHERE u.email = 'luishenrisc1@gmail.com';

-- 5. Verificar se foram criados
SELECT 
    'Usuários admin criados:' as status,
    p.id,
    p.nome,
    p.email,
    p.perfil_acesso,
    p.ativo
FROM public.profiles p
WHERE p.email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 6. Verificar todos os usuários
SELECT 
    'Todos os usuários:' as status,
    COUNT(*) as total
FROM public.profiles;
