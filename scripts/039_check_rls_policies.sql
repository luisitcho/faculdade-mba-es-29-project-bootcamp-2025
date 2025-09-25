-- Script para verificar e corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar políticas RLS ativas
SELECT 
    'Políticas RLS da tabela profiles:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 2. Deletar todas as políticas existentes
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- 3. Criar políticas RLS mais permissivas para debug
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE TO authenticated USING (true);

-- 4. Verificar se as políticas foram criadas
SELECT 
    'Novas políticas RLS:' as info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 5. Testar consulta direta
SELECT 
    'Teste de consulta direta:' as info,
    id,
    nome,
    email,
    perfil_acesso,
    ativo
FROM public.profiles 
WHERE email = 'luishenrisc1@gmail.com';

-- 6. Verificar se o usuário tem permissão
SELECT 
    'Verificar permissões do usuário:' as info,
    auth.uid() as current_user_id,
    'luishenrisc1@gmail.com' as target_email;

-- 7. Testar consulta com o ID específico
SELECT 
    'Teste com ID específico:' as info,
    p.id,
    p.nome,
    p.email,
    p.perfil_acesso,
    p.ativo
FROM public.profiles p
WHERE p.id = (
    SELECT id FROM auth.users WHERE email = 'luishenrisc1@gmail.com'
);
