-- Script para corrigir o trigger e garantir que funcione
-- Execute este script no SQL Editor do Supabase

-- 1. Deletar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Deletar função existente
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Criar nova função mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil com dados mais robustos
  INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'nome'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
      'Usuário ' || SUBSTRING(NEW.email, 1, POSITION('@' IN NEW.email) - 1)
    ),
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'perfil_acesso', ''),
      'consulta'
    ),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'nome'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
      profiles.nome
    ),
    perfil_acesso = COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'perfil_acesso', ''),
      profiles.perfil_acesso
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 4. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar se o trigger foi criado
SELECT 
    'Trigger criado:' as status,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- 6. Testar criando um usuário de teste (opcional)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--   gen_random_uuid(),
--   'teste@teste.com',
--   crypt('123456', gen_salt('bf')),
--   NOW(),
--   '{"nome": "Usuário Teste", "perfil_acesso": "consulta"}'
-- );

-- 7. Verificar se o perfil foi criado automaticamente
-- SELECT * FROM public.profiles WHERE email = 'teste@teste.com';

-- 8. Deletar usuário de teste (opcional)
-- DELETE FROM auth.users WHERE email = 'teste@teste.com';
-- DELETE FROM public.profiles WHERE email = 'teste@teste.com';
