/*
# Inserir usuário administrador padrão

1. Usuário Admin
   - Username: admin
   - Senha: cedtec2025
   - Role: admin
   - Nome completo: Administrador CEDTEC

2. Observações
   - Usuário será criado via auth.users do Supabase
   - Profile correspondente será criado automaticamente
   - Senha deve ser alterada no primeiro login em produção
*/

-- Inserir usuário admin via função do Supabase
-- NOTA: Este SQL deve ser executado manualmente no painel do Supabase
-- ou via função personalizada, pois requer privilégios especiais

-- Função para criar usuário admin
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Criar usuário na tabela auth.users (simulação - em produção seria via API)
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@cedtec.local',
    crypt('cedtec2025', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "admin"}'
  )
  RETURNING id INTO admin_user_id;

  -- Criar profile correspondente
  INSERT INTO profiles (
    id,
    username,
    role,
    full_name
  ) VALUES (
    admin_user_id,
    'admin',
    'admin',
    'Administrador CEDTEC'
  );
END;
$$;

-- Comentário: Execute esta função manualmente no painel do Supabase
-- SELECT create_admin_user();