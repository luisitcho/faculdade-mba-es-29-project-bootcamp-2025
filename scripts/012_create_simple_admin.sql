-- Criar usuário admin simples sem validações complexas
-- Remove qualquer usuário admin anterior
DELETE FROM auth.users WHERE email = 'admin';
DELETE FROM usuarios WHERE email = 'admin';

-- Cria o usuário admin diretamente
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
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Cria o perfil do usuário admin
INSERT INTO usuarios (
  id,
  nome,
  email,
  perfil_acesso,
  ativo,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin'),
  'Administrador',
  'admin',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Confirma que foi criado
SELECT 'Usuário admin criado com sucesso!' as resultado;
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin';
SELECT nome, email, perfil_acesso FROM usuarios WHERE email = 'admin';
