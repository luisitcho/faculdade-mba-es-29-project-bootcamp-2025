-- Remover a coluna unidade_id da tabela produtos (relacionamento 1:1)
ALTER TABLE public.produtos DROP COLUMN IF EXISTS unidade_id;

-- Criar tabela intermediária para relacionamento muitos-para-muitos
CREATE TABLE IF NOT EXISTS public.produto_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  estoque_local INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(produto_id, unidade_id)
);

-- Habilitar RLS na tabela produto_unidades
ALTER TABLE public.produto_unidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produto_unidades
CREATE POLICY "produto_unidades_select_all" ON public.produto_unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "produto_unidades_insert_auth" ON public.produto_unidades FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('admin', 'operador'))
);
CREATE POLICY "produto_unidades_update_auth" ON public.produto_unidades FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('admin', 'operador'))
);
CREATE POLICY "produto_unidades_delete_auth" ON public.produto_unidades FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('admin', 'operador'))
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produto_unidades_produto ON public.produto_unidades(produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_unidades_unidade ON public.produto_unidades(unidade_id);

-- Migrar dados existentes (se houver produtos sem unidades, associar à unidade principal)
INSERT INTO public.produto_unidades (produto_id, unidade_id, estoque_local)
SELECT p.id, u.id, p.estoque_atual
FROM public.produtos p
CROSS JOIN (SELECT id FROM public.unidades WHERE nome = 'Unidade Principal' LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM public.produto_unidades pu WHERE pu.produto_id = p.id
);
