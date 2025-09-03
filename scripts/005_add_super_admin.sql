-- Adicionar perfil super_admin à tabela profiles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_perfil_acesso_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_perfil_acesso_check 
CHECK (perfil_acesso IN ('super_admin', 'admin', 'operador', 'consulta'));

-- Criar função para verificar hierarquia de perfis
CREATE OR REPLACE FUNCTION public.get_perfil_hierarchy_level(perfil TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE perfil
    WHEN 'super_admin' THEN RETURN 4;
    WHEN 'admin' THEN RETURN 3;
    WHEN 'operador' THEN RETURN 2;
    WHEN 'consulta' THEN RETURN 1;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Atualizar políticas RLS para incluir super_admin
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('super_admin', 'admin'))
);

-- Política para permitir super_admin criar outros perfis
DROP POLICY IF EXISTS "profiles_insert_super_admin" ON public.profiles;
CREATE POLICY "profiles_insert_super_admin" ON public.profiles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso = 'super_admin')
);

-- Política para permitir super_admin e admin atualizar perfis (com restrição de hierarquia)
DROP POLICY IF EXISTS "profiles_update_hierarchy" ON public.profiles;
CREATE POLICY "profiles_update_hierarchy" ON public.profiles FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles p1 
    WHERE p1.id = auth.uid() 
    AND (
      p1.perfil_acesso = 'super_admin' 
      OR (p1.perfil_acesso = 'admin' AND public.get_perfil_hierarchy_level(profiles.perfil_acesso) < 3)
    )
  )
);

-- Atualizar políticas de produtos para incluir super_admin
DROP POLICY IF EXISTS "produtos_insert_admin" ON public.produtos;
CREATE POLICY "produtos_insert_admin" ON public.produtos FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('super_admin', 'admin', 'operador'))
);

DROP POLICY IF EXISTS "produtos_update_admin" ON public.produtos;
CREATE POLICY "produtos_update_admin" ON public.produtos FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('super_admin', 'admin', 'operador'))
);

DROP POLICY IF EXISTS "produtos_delete_admin" ON public.produtos;
CREATE POLICY "produtos_delete_admin" ON public.produtos FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('super_admin', 'admin'))
);

-- Atualizar políticas de movimentações para incluir super_admin
DROP POLICY IF EXISTS "movimentacoes_insert_operador" ON public.movimentacoes;
CREATE POLICY "movimentacoes_insert_operador" ON public.movimentacoes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND perfil_acesso IN ('super_admin', 'admin', 'operador'))
);

-- Criar usuário super admin padrão (será criado quando alguém se cadastrar com este email)
-- Função para promover primeiro usuário a super_admin
CREATE OR REPLACE FUNCTION public.create_super_admin_if_first()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários existem
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Se for o primeiro usuário, torná-lo super_admin
  IF user_count = 0 THEN
    NEW.perfil_acesso = 'super_admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para promover primeiro usuário
DROP TRIGGER IF EXISTS trigger_create_super_admin ON public.profiles;
CREATE TRIGGER trigger_create_super_admin
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_super_admin_if_first();
