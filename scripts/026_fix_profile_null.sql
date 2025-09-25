-- Script para corrigir o problema do profile null
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o usuário atual logado
-- (Execute este script enquanto estiver logado no sistema)

-- 2. Garantir que todos os usuários em auth.users tenham perfil
INSERT INTO public.profiles (id, nome, email, perfil_acesso, ativo)
SELECT 
    u.id,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data ->> 'nome'), ''),
        NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
        'Usuário ' || SUBSTRING(u.email, 1, POSITION('@' IN u.email) - 1)
    ),
    u.email,
    CASE 
        WHEN u.email = 'admin@admin.com' THEN 'admin'
        WHEN u.email = 'luishenrisc1@gmail.com' THEN 'admin'
        WHEN u.raw_user_meta_data ->> 'perfil_acesso' IS NOT NULL THEN u.raw_user_meta_data ->> 'perfil_acesso'
        ELSE 'consulta'
    END,
    true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Atualizar usuários admin para garantir que tenham os dados corretos
UPDATE public.profiles 
SET 
    nome = 'Administrador',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW()
WHERE email = 'admin@admin.com';

UPDATE public.profiles 
SET 
    nome = 'Admin Luis',
    perfil_acesso = 'admin',
    ativo = true,
    updated_at = NOW()
WHERE email = 'luishenrisc1@gmail.com';

-- 4. Verificar se todos os usuários agora têm perfil
SELECT 
    'Verificação final - todos os usuários devem ter perfil:' as status,
    u.id,
    u.email,
    p.nome,
    p.perfil_acesso,
    p.ativo
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 5. Testar a consulta que o sistema usa
-- (Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário logado)
-- SELECT * FROM public.profiles WHERE id = 'SEU_USER_ID_AQUI';

-- 6. Verificar políticas RLS
SELECT 
    'Políticas RLS ativas:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles';
