-- Garantir que a foreign key entre produtos e categorias existe
-- Primeiro, verificar se a coluna categoria_id existe
DO $$ 
BEGIN
  -- Se a coluna não existir, adicionar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'produtos' 
    AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE public.produtos ADD COLUMN categoria_id UUID;
  END IF;
END $$;

-- Remover a constraint antiga se existir
ALTER TABLE public.produtos DROP CONSTRAINT IF EXISTS produtos_categoria_id_fkey;

-- Adicionar a foreign key constraint
ALTER TABLE public.produtos 
ADD CONSTRAINT produtos_categoria_id_fkey 
FOREIGN KEY (categoria_id) 
REFERENCES public.categorias(id) 
ON DELETE RESTRICT;

-- Atualizar produtos sem categoria para a primeira categoria disponível
UPDATE public.produtos 
SET categoria_id = (SELECT id FROM public.categorias LIMIT 1)
WHERE categoria_id IS NULL;

-- Tornar a coluna NOT NULL após garantir que todos os produtos têm categoria
ALTER TABLE public.produtos ALTER COLUMN categoria_id SET NOT NULL;

-- Recarregar o schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
