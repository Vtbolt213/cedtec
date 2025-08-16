/*
  # Adicionar usuário admin padrão

  1. Usuário Admin
    - Username: admin
    - Email: admin@cedtec.local
    - Senha: admin123
    - Role: admin
    - Nome: Administrador do Sistema

  2. Segurança
    - Usuário criado diretamente no auth.users
    - Perfil criado automaticamente via trigger
*/

-- Inserir usuário admin diretamente na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@cedtec.local',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "admin", "full_name": "Administrador do Sistema", "role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- O perfil será criado automaticamente pelo trigger handle_new_user