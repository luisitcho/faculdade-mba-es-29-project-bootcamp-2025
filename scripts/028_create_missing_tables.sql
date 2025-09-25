-- Script para criar tabelas que estão faltando
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela notificacoes se não existir
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'error', 'success')),
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS na tabela notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para notificacoes
CREATE POLICY "notificacoes_select_own" ON public.notificacoes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "notificacoes_insert_own" ON public.notificacoes FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "notificacoes_update_own" ON public.notificacoes FOR UPDATE USING (auth.uid() = usuario_id);

-- 4. Criar tabela produtos se não existir
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria_id UUID,
    unidade_medida TEXT NOT NULL,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_atual INTEGER DEFAULT 0,
    valor_unitario DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela categorias se não existir
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela movimentacoes se não existir
CREATE TABLE IF NOT EXISTS public.movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES public.produtos(id),
    tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida')),
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    observacoes TEXT,
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inserir categorias padrão se não existirem
INSERT INTO public.categorias (nome, descricao) VALUES
    ('Alimentação', 'Produtos alimentícios e bebidas'),
    ('Higiene/Limpeza', 'Produtos de higiene pessoal e limpeza'),
    ('Pedagógico', 'Materiais pedagógicos e educacionais'),
    ('Bens', 'Bens patrimoniais e equipamentos')
ON CONFLICT (nome) DO NOTHING;

-- 8. Habilitar RLS nas outras tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS básicas
CREATE POLICY "produtos_select_all" ON public.produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "categorias_select_all" ON public.categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "movimentacoes_select_all" ON public.movimentacoes FOR SELECT TO authenticated USING (true);

-- 10. Verificar se todas as tabelas foram criadas
SELECT 
    'Tabelas criadas com sucesso:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
