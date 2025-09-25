-- Remove qualquer usuário admin anterior
DELETE FROM auth.users WHERE email = 'admin@admin.com';
DELETE FROM usuarios WHERE email = 'admin@admin.com';

-- Criar usuário admin diretamente na tabela auth.users com confirmação automática
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.com',
  crypt('admin123', gen_salt('bf')), -- Hash da senha admin123
  NOW(), -- Email já confirmado
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  NOW()
);

-- Criar registro na tabela usuarios usando o ID do usuário criado
INSERT INTO usuarios (id, nome, email, senha, tipo, ativo, created_at, updated_at)
SELECT 
  u.id,
  'Administrador',
  'admin@admin.com',
  crypt('admin123', gen_salt('bf')),
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'admin@admin.com';
