/*
  # Recriar tabela profiles

  1. Limpeza
    - Remove políticas existentes
    - Remove tabela profiles se existir
    - Remove função de trigger se existir

  2. Nova estrutura
    - Tabela `profiles` com campos atualizados
    - Políticas RLS apropriadas
    - Trigger para updated_at
    - Função para atualizar timestamp

  3. Segurança
    - RLS habilitado
    - Políticas para usuários e admins
*/

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Remover tabela se existir
DROP TABLE IF EXISTS profiles CASCADE;

-- Remover função de trigger se existir
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'professor' CHECK (role IN ('professor', 'admin')),
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índice para username
CREATE INDEX idx_profiles_username ON profiles(username);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Criar trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();