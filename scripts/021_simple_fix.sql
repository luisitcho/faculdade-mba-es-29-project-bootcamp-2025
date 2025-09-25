-- Script SIMPLES para criar a tabela profiles e corrigir tudo
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL DEFAULT 'Usuário',
    email TEXT NOT NULL,
    perfil_acesso TEXT NOT NULL DEFAULT 'consulta' CHECK (perfil_acesso IN ('admin', 'operador', 'consulta')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS básicas
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Política para admins verem todos os perfis
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);

-- 5. Política para admins atualizarem perfis
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);

-- 6. Criar função para trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, perfil_acesso)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'nome'), ''),
      'Usuário'
    ),
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'perfil_acesso', ''),
      'consulta'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'nome'), ''),
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

-- 7. Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Verificar se a tabela foi criada
SELECT 
    'Tabela profiles criada com sucesso!' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
