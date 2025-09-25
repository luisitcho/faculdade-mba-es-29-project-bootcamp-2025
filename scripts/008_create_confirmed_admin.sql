-- Criar usuário admin já confirmado
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Verificar se já existe um usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@admin.com';
    
    -- Se existir, deletar primeiro
    IF admin_user_id IS NOT NULL THEN
        DELETE FROM public.profiles WHERE id = admin_user_id;
        DELETE FROM auth.users WHERE id = admin_user_id;
        RAISE NOTICE 'Usuário admin anterior removido.';
    END IF;
    
    -- Criar novo usuário admin já confirmado
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        phone_confirmed_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change,
        email_change_token_new,
        email_change_token_current,
        confirmation_token,
        recovery_token,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@admin.com',
        crypt('admin123', gen_salt('bf')),
        NOW(), -- Email já confirmado
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        NOW(),
        NOW(),
        NULL,
        '',
        '',
        NULL,
        '',
        '',
        '',
        '',
        '',
        '',
        NULL
    ) RETURNING id INTO admin_user_id;
    
    -- Criar perfil do admin
    INSERT INTO public.profiles (
        id,
        nome,
        email,
        perfil_acesso,
        ativo
    ) VALUES (
        admin_user_id,
        'Administrador',
        'admin@admin.com',
        'admin',
        true
    );
    
    RAISE NOTICE 'Usuário admin criado e confirmado! Email: admin@admin.com, Senha: admin123';
END $$;
