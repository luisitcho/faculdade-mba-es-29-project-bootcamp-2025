-- Script para corrigir a estrutura da base de dados
-- Este script verifica e corrige a tabela profiles

-- 1. Verificar se a tabela profiles existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Se a tabela não existir ou estiver incompleta, recriar
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Criar tabela profiles com estrutura correta
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL DEFAULT 'Usuário',
    email TEXT NOT NULL,
    perfil_acesso TEXT NOT NULL DEFAULT 'consulta' CHECK (perfil_acesso IN ('admin', 'operador', 'consulta')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Política para permitir admins ver todos os perfis
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);

-- 7. Política para permitir admins atualizar perfis
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);

-- 8. Criar função para criar perfil automaticamente no cadastro
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
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
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

-- 9. Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. Criar usuários admin principais
DO $$
DECLARE
    admin_user_id UUID;
    luis_user_id UUID;
BEGIN
    -- Criar usuário admin@admin.com
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
        raw_user_meta_data
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@admin.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nome": "Administrador", "perfil_acesso": "admin"}'
    ) RETURNING id INTO admin_user_id;
    
    -- Criar perfil do admin
    INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
    VALUES (admin_user_id, 'Administrador', 'admin@admin.com', 'admin', true);
    
    -- Criar usuário luishenrisc1@gmail.com
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
        raw_user_meta_data
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
        '{"nome": "Admin Luis", "perfil_acesso": "admin"}'
    ) RETURNING id INTO luis_user_id;
    
    -- Criar perfil do luis
    INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
    VALUES (luis_user_id, 'Admin Luis', 'luishenrisc1@gmail.com', 'admin', true);
    
    RAISE NOTICE 'Usuários admin criados com sucesso!';
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Usuários admin já existem.';
END $$;

-- 11. Verificar resultado
SELECT 
    'Estrutura da tabela profiles:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. Verificar usuários criados
SELECT 
    'Usuários na tabela profiles:' as info,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;
