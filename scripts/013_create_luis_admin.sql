-- Criar usuário admin luishenrisc1@gmail.com com senha 123456
-- Remove qualquer usuário anterior
DELETE FROM auth.users WHERE email = 'luishenrisc1@gmail.com';
DELETE FROM public.usuarios WHERE email = 'luishenrisc1@gmail.com';

-- Criar usuário na tabela auth.users (Supabase)
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
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
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
    '{"name": "Admin Luis"}',
    false,
    '',
    '',
    '',
    ''
);

-- Criar usuário na tabela usuarios
INSERT INTO public.usuarios (
    nome,
    email,
    tipo,
    ativo,
    created_at,
    updated_at
) VALUES (
    'Admin Luis',
    'luishenrisc1@gmail.com',
    'admin',
    true,
    NOW(),
    NOW()
);

-- Confirmar que foi criado
SELECT 'Usuário admin criado com sucesso!' as resultado;
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'luishenrisc1@gmail.com';
SELECT nome, email, tipo FROM public.usuarios WHERE email = 'luishenrisc1@gmail.com';
