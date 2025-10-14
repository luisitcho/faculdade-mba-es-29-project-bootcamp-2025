-- Script SQL para criar usuário admin principal
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se há usuários na tabela auth.users
-- (Esta consulta só funciona no SQL Editor do Supabase, não via API)

-- Inserir um usuário admin diretamente na tabela profiles
-- Você precisa substituir o UUID abaixo pelo ID de um usuário real da tabela auth.users
-- Para obter o ID, faça login no sistema e verifique o ID do usuário

-- Exemplo de inserção (substitua o UUID pelo ID real do usuário):
INSERT INTO public.profiles (
  id,
  nome,
  email,
  perfil_acesso,
  ativo,
  created_at,
  updated_at
) VALUES (
  'SUBSTITUA_PELO_ID_DO_USUARIO', -- Substitua pelo ID real do usuário
  'Administrador Principal',
  'luishenrisc1@gmail.com',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  perfil_acesso = EXCLUDED.perfil_acesso,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- Para verificar se foi inserido corretamente:
SELECT * FROM public.profiles WHERE email = 'luishenrisc1@gmail.com';
