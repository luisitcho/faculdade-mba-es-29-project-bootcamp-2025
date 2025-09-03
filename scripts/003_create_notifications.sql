-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('estoque_baixo', 'estoque_zero', 'movimentacao', 'sistema')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela notificações
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "notificacoes_select_own" ON public.notificacoes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "notificacoes_update_own" ON public.notificacoes FOR UPDATE USING (auth.uid() = usuario_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at);

-- Função para criar notificação de estoque baixo
CREATE OR REPLACE FUNCTION public.criar_notificacao_estoque_baixo()
RETURNS TRIGGER AS $$
DECLARE
  usuario_record RECORD;
BEGIN
  -- Verificar se o estoque ficou baixo ou zerou
  IF NEW.estoque_atual <= NEW.estoque_minimo AND OLD.estoque_atual > NEW.estoque_minimo THEN
    -- Criar notificação para todos os usuários admin e operador
    FOR usuario_record IN 
      SELECT id FROM public.profiles 
      WHERE perfil_acesso IN ('admin', 'operador') AND ativo = true
    LOOP
      INSERT INTO public.notificacoes (
        usuario_id,
        tipo,
        titulo,
        mensagem,
        metadata
      ) VALUES (
        usuario_record.id,
        CASE WHEN NEW.estoque_atual = 0 THEN 'estoque_zero' ELSE 'estoque_baixo' END,
        CASE WHEN NEW.estoque_atual = 0 THEN 'Produto sem estoque' ELSE 'Estoque baixo' END,
        CASE 
          WHEN NEW.estoque_atual = 0 THEN 
            'O produto "' || NEW.nome || '" está sem estoque.'
          ELSE 
            'O produto "' || NEW.nome || '" está com estoque baixo (' || NEW.estoque_atual || ' ' || NEW.unidade_medida || ').'
        END,
        jsonb_build_object(
          'produto_id', NEW.id,
          'produto_nome', NEW.nome,
          'estoque_atual', NEW.estoque_atual,
          'estoque_minimo', NEW.estoque_minimo,
          'unidade_medida', NEW.unidade_medida
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para notificações de estoque
DROP TRIGGER IF EXISTS trigger_notificacao_estoque_baixo ON public.produtos;
CREATE TRIGGER trigger_notificacao_estoque_baixo
  AFTER UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_notificacao_estoque_baixo();

-- Função para criar notificação de movimentação grande
CREATE OR REPLACE FUNCTION public.criar_notificacao_movimentacao()
RETURNS TRIGGER AS $$
DECLARE
  usuario_record RECORD;
  produto_record RECORD;
BEGIN
  -- Buscar dados do produto
  SELECT nome, unidade_medida INTO produto_record
  FROM public.produtos WHERE id = NEW.produto_id;
  
  -- Criar notificação para movimentações grandes (mais de 100 unidades)
  IF NEW.quantidade >= 100 THEN
    -- Criar notificação para todos os usuários admin
    FOR usuario_record IN 
      SELECT id FROM public.profiles 
      WHERE perfil_acesso = 'admin' AND ativo = true
    LOOP
      INSERT INTO public.notificacoes (
        usuario_id,
        tipo,
        titulo,
        mensagem,
        metadata
      ) VALUES (
        usuario_record.id,
        'movimentacao',
        'Movimentação grande registrada',
        'Foi registrada uma ' || NEW.tipo_movimentacao || ' de ' || NEW.quantidade || ' ' || produto_record.unidade_medida || ' do produto "' || produto_record.nome || '".',
        jsonb_build_object(
          'movimentacao_id', NEW.id,
          'produto_id', NEW.produto_id,
          'produto_nome', produto_record.nome,
          'tipo_movimentacao', NEW.tipo_movimentacao,
          'quantidade', NEW.quantidade,
          'unidade_medida', produto_record.unidade_medida
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para notificações de movimentação
DROP TRIGGER IF EXISTS trigger_notificacao_movimentacao ON public.movimentacoes;
CREATE TRIGGER trigger_notificacao_movimentacao
  AFTER INSERT ON public.movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_notificacao_movimentacao();
