-- Criar usuário admin padrão se não existir
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Verificar se já existe um usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@admin.com';
    
    -- Se não existir, criar o usuário admin
    IF admin_user_id IS NULL THEN
        -- Inserir na tabela auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@admin.com',
            crypt('admin', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        -- Inserir o perfil do admin
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
        
        RAISE NOTICE 'Usuário admin criado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuário admin já existe.';
    END IF;
END $$;
