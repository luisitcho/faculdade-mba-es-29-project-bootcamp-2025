-- Script de verificação final da base de dados
-- Execute APÓS os scripts 018 e 019

-- 1. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura da tabela profiles:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se as políticas RLS estão ativas
SELECT 
    'Políticas RLS ativas:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Verificar se o trigger está ativo
SELECT 
    'Triggers ativos:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- 4. Contar usuários por perfil
SELECT 
    'Usuários por perfil:' as info,
    perfil_acesso,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM public.profiles 
GROUP BY perfil_acesso
ORDER BY 
    CASE perfil_acesso 
        WHEN 'admin' THEN 1 
        WHEN 'operador' THEN 2 
        WHEN 'consulta' THEN 3 
        ELSE 4 
    END;

-- 5. Verificar usuários admin principais
SELECT 
    'Admins principais:' as info,
    email,
    nome,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
WHERE email IN ('admin@admin.com', 'luishenrisc1@gmail.com')
ORDER BY email;

-- 6. Verificar se há usuários com nomes vazios ou nulos
SELECT 
    'Usuários com problemas de nome:' as info,
    COUNT(*) as total
FROM public.profiles 
WHERE nome IS NULL OR nome = '' OR nome = 'Usuário';

-- 7. Mostrar todos os usuários (resumo)
SELECT 
    'Resumo geral:' as info,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN perfil_acesso = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN perfil_acesso = 'operador' THEN 1 END) as operadores,
    COUNT(CASE WHEN perfil_acesso = 'consulta' THEN 1 END) as consultas,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM public.profiles;

-- 8. Listar todos os usuários
SELECT 
    id,
    nome,
    email,
    perfil_acesso,
    ativo,
    created_at
FROM public.profiles 
ORDER BY 
    CASE perfil_acesso 
        WHEN 'admin' THEN 1 
        WHEN 'operador' THEN 2 
        WHEN 'consulta' THEN 3 
        ELSE 4 
    END,
    created_at DESC;
