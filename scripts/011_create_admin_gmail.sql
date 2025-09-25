-- Criar usuário admin com @gmail.com como alternativa
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Deletar qualquer usuário admin@gmail.com existente
    DELETE FROM auth.users WHERE email = 'admin@gmail.com';
    DELETE FROM public.profiles WHERE email = 'admin@gmail.com';
    
    -- Criar o usuário admin diretamente na tabela auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@gmail.com',
        crypt('admin123', gen_salt('bf')), -- Hash da senha admin123
        NOW(), -- Email já confirmado
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        FALSE,
        NULL
    ) RETURNING id INTO admin_user_id;
    
    -- Criar o perfil do admin
    INSERT INTO public.profiles (
        id,
        email,
        nome,
        tipo_usuario,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin@gmail.com',
        'Administrador',
        'admin',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Usuário admin criado com sucesso!';
    RAISE NOTICE 'Email: admin@gmail.com';
    RAISE NOTICE 'Senha: admin123';
    RAISE NOTICE 'Tipo: admin';
    
END $$;
