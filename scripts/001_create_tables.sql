-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil_acesso TEXT NOT NULL CHECK (perfil_acesso IN ('admin', 'operador', 'consulta')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE CHECK (nome IN ('Alimentação', 'Higiene/Limpeza', 'Pedagógico', 'Bens')),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO public.categorias (nome, descricao) VALUES
  ('Alimentação', 'Produtos alimentícios e bebidas'),
  ('Higiene/Limpeza', 'Produtos de higiene pessoal e limpeza'),
  ('Pedagógico', 'Materiais pedagógicos e educacionais'),
  ('Bens', 'Bens patrimoniais e equipamentos')
ON CONFLICT (nome) DO NOTHING;

-- Habilitar RLS na tabela categorias (somente leitura para todos)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_select_all" ON public.categorias FOR SELECT TO authenticated USING (true);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id),
  unidade_medida TEXT NOT NULL,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  valor_unitario DECIMAL(10,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela produtos
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos_select_all" ON public.produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "produtos_insert_admin" ON public.produtos FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('admin', 'operador'))
);
CREATE POLICY "produtos_update_admin" ON public.produtos FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('admin', 'operador'))
);
CREATE POLICY "produtos_delete_admin" ON public.produtos FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'admin')
);

-- Criar tabela de movimentações
CREATE TABLE IF NOT EXISTS public.movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  observacoes TEXT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela movimentações
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movimentacoes_select_all" ON public.movimentacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "movimentacoes_insert_operador" ON public.movimentacoes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('admin', 'operador'))
);

-- Criar função para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_estoque()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_movimentacao = 'entrada' THEN
    UPDATE public.produtos 
    SET estoque_atual = estoque_atual + NEW.quantidade,
        updated_at = NOW()
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo_movimentacao = 'saida' THEN
    UPDATE public.produtos 
    SET estoque_atual = estoque_atual - NEW.quantidade,
        updated_at = NOW()
    WHERE id = NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar estoque
DROP TRIGGER IF EXISTS trigger_atualizar_estoque ON public.movimentacoes;
CREATE TRIGGER trigger_atualizar_estoque
  AFTER INSERT ON public.movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_estoque();
