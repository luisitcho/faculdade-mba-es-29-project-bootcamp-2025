-- Desabilitar confirmação de email no Supabase
-- Este script configura o Supabase para não exigir confirmação de email

-- Atualizar configuração de autenticação
UPDATE auth.config 
SET email_confirm_required = false
WHERE id = 1;

-- Confirmar automaticamente todos os usuários existentes
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
