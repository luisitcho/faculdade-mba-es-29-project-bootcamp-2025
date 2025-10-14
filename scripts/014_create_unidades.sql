-- Criar tabela de unidades
CREATE TABLE IF NOT EXISTS public.unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  endereco TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela unidades
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para unidades
CREATE POLICY "unidades_select_all" ON public.unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "unidades_insert_admin" ON public.unidades FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);
CREATE POLICY "unidades_update_admin" ON public.unidades FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);
CREATE POLICY "unidades_delete_admin" ON public.unidades FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);

-- Adicionar coluna unidade_id na tabela produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES public.unidades(id);

-- Criar unidade padrão se não existir
INSERT INTO public.unidades (nome, descricao) 
VALUES ('Unidade Principal', 'Unidade padrão do sistema')
ON CONFLICT DO NOTHING;

-- Atualizar produtos existentes para usar a unidade padrão
UPDATE public.produtos 
SET unidade_id = (SELECT id FROM public.unidades WHERE nome = 'Unidade Principal' LIMIT 1)
WHERE unidade_id IS NULL;
