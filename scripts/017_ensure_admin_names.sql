-- Script para garantir que os usuários admin principais tenham nomes corretos

-- 1. Verificar usuários admin existentes
SELECT 
    'Usuários admin antes da correção:' as status,
    id,
    nome,
    email,
    perfil_acesso
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 2. Atualizar/criar usuário admin@admin.com
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar ou criar usuário na auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
    
    IF admin_user_id IS NULL THEN
        -- Criar usuário na auth.users
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
        ) RETURNING id INTO admin_user_id;
    END IF;
    
    -- Criar ou atualizar perfil
    INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
    VALUES (admin_user_id, 'Administrador', 'admin@admin.com', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET
        nome = 'Administrador',
        perfil_acesso = 'admin',
        ativo = true,
        updated_at = NOW();
END $$;

-- 3. Atualizar/criar usuário luishenrisc1@gmail.com
DO $$
DECLARE
    luis_user_id UUID;
BEGIN
    -- Buscar ou criar usuário na auth.users
    SELECT id INTO luis_user_id FROM auth.users WHERE email = 'luishenrisc1@gmail.com';
    
    IF luis_user_id IS NULL THEN
        -- Criar usuário na auth.users
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
        ) RETURNING id INTO luis_user_id;
    END IF;
    
    -- Criar ou atualizar perfil
    INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
    VALUES (luis_user_id, 'Admin Luis', 'luishenrisc1@gmail.com', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET
        nome = 'Admin Luis',
        perfil_acesso = 'admin',
        ativo = true,
        updated_at = NOW();
END $$;

-- 4. Verificar resultado final
SELECT 
    'Usuários admin após correção:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 5. Verificar todos os usuários
SELECT 
    'Todos os usuários:' as status,
    COUNT(*) as total
FROM public.profiles;

SELECT 
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;
