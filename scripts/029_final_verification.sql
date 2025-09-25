-- Script de verificação final
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se todos os usuários têm perfil
SELECT 
    'Verificação final - todos os usuários devem ter perfil:' as status,
    u.id,
    u.email,
    u.email_confirmed_at,
    p.nome,
    p.perfil_acesso,
    p.ativo,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        ELSE '✅ COM PERFIL'
    END as status_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Verificar usuários admin específicos
SELECT 
    'Usuários admin principais:' as status,
    u.id,
    u.email,
    p.nome,
    p.perfil_acesso,
    p.ativo,
    CASE 
        WHEN p.perfil_acesso = 'admin' THEN '✅ ADMIN'
        ELSE '❌ NÃO É ADMIN'
    END as status_admin
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@admin.com', 'luishenrisc1@gmail.com');

-- 3. Verificar se as tabelas necessárias existem
SELECT 
    'Tabelas do sistema:' as status,
    table_name,
    CASE 
        WHEN table_name = 'profiles' THEN '✅ PERFIS'
        WHEN table_name = 'notificacoes' THEN '✅ NOTIFICAÇÕES'
        WHEN table_name = 'produtos' THEN '✅ PRODUTOS'
        WHEN table_name = 'categorias' THEN '✅ CATEGORIAS'
        WHEN table_name = 'movimentacoes' THEN '✅ MOVIMENTAÇÕES'
        ELSE '✅ OUTRAS'
    END as status_tabela
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. Verificar políticas RLS
SELECT 
    'Políticas RLS ativas:' as status,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN policyname LIKE '%select%' THEN '✅ LEITURA'
        WHEN policyname LIKE '%insert%' THEN '✅ CRIAÇÃO'
        WHEN policyname LIKE '%update%' THEN '✅ ATUALIZAÇÃO'
        WHEN policyname LIKE '%delete%' THEN '✅ EXCLUSÃO'
        ELSE '✅ OUTRAS'
    END as tipo_politica
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Contar registros em cada tabela
SELECT 
    'Contagem de registros:' as status,
    'profiles' as tabela,
    COUNT(*) as total
FROM public.profiles
UNION ALL
SELECT 
    'Contagem de registros:' as status,
    'notificacoes' as tabela,
    COUNT(*) as total
FROM public.notificacoes
UNION ALL
SELECT 
    'Contagem de registros:' as status,
    'produtos' as tabela,
    COUNT(*) as total
FROM public.produtos
UNION ALL
SELECT 
    'Contagem de registros:' as status,
    'categorias' as tabela,
    COUNT(*) as total
FROM public.categorias
UNION ALL
SELECT 
    'Contagem de registros:' as status,
    'movimentacoes' as tabela,
    COUNT(*) as total
FROM public.movimentacoes;

-- 6. Teste de consulta que o sistema usa
-- (Substitua 'SEU_USER_ID' pelo ID do usuário logado)
SELECT 
    'Teste da consulta do sistema:' as status,
    'Execute esta consulta substituindo o ID pelo seu:' as info,
    'SELECT * FROM public.profiles WHERE id = ''SEU_USER_ID'';' as consulta_teste;
