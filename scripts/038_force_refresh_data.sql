-- Script para forçar atualização dos dados e limpar cache
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se os dados estão corretos na base
SELECT 
    'Dados na base de dados:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at,
    updated_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 2. Forçar atualização do timestamp para quebrar cache
UPDATE public.profiles 
SET 
    updated_at = NOW(),
    nome = CASE 
        WHEN email = 'admin@admin.com' THEN 'Administrador'
        WHEN email = 'luishenrisc1@gmail.com' THEN 'Luis Henrique'
        ELSE nome
    END,
    perfil_acesso = 'admin'
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 3. Verificar se foi atualizado
SELECT 
    'Dados após atualização:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    updated_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 4. Testar consulta específica por ID
SELECT 
    'Teste por ID do luishenrisc1@gmail.com:' as info,
    p.id,
    p.nome,
    p.email,
    p.perfil_acesso,
    p.ativo
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'luishenrisc1@gmail.com';

-- 5. Verificar se há múltiplos registros
SELECT 
    'Verificar duplicatas:' as info,
    email,
    COUNT(*) as total_registros
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
GROUP BY email
HAVING COUNT(*) > 1;

-- 6. Se houver duplicatas, deletar as antigas
DELETE FROM public.profiles 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC) as rn
        FROM public.profiles 
        WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
    ) t WHERE rn > 1
);

-- 7. Verificar resultado final
SELECT 
    'Resultado final:' as status,
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    updated_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;
