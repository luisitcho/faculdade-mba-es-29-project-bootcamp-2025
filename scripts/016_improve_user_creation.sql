-- Script para melhorar a criação de usuários e garantir que os nomes sejam salvos corretamente

-- 1. Atualizar a função de criação de perfil para ser mais robusta
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
      'Usuário'
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

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Atualizar usuários existentes que podem ter nomes vazios
UPDATE public.profiles 
SET nome = 'Administrador'
WHERE email = 'admin@admin.com' AND (nome IS NULL OR nome = 'Usuário' OR nome = '');

UPDATE public.profiles 
SET nome = 'Admin Luis'
WHERE email = 'luishenrisc1@gmail.com' AND (nome IS NULL OR nome = 'Usuário' OR nome = '');

-- 4. Atualizar outros usuários que podem ter nomes vazios
UPDATE public.profiles 
SET nome = 'Usuário ' || SUBSTRING(email, 1, POSITION('@' IN email) - 1)
WHERE (nome IS NULL OR nome = 'Usuário' OR nome = '') 
AND email IS NOT NULL 
AND email != 'admin@admin.com' 
AND email != 'luishenrisc1@gmail.com';

-- 5. Verificar resultado
SELECT 
    'Usuários atualizados:' as status,
    COUNT(*) as total
FROM public.profiles 
WHERE nome IS NOT NULL AND nome != 'Usuário' AND nome != '';

-- 6. Mostrar todos os usuários
SELECT 
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;
