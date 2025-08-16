/*
  # Corrigir políticas RLS para admin ver todos os tickets

  1. Políticas atualizadas
    - Admins podem ver todos os tickets
    - Professores veem apenas seus próprios tickets
  2. Verificações
    - Confirmar que políticas foram aplicadas corretamente
*/

-- Remover políticas existentes da tabela tickets
DROP POLICY IF EXISTS "Users can read own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON tickets;

-- Criar novas políticas que permitem admin ver todos os tickets
CREATE POLICY "Users can read tickets" ON tickets
  FOR SELECT
  TO authenticated
  USING (
    -- Usuário pode ver seus próprios tickets OU é admin
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own tickets" ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update tickets" ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    -- Usuário pode atualizar seus próprios tickets OU é admin
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Atualizar políticas da tabela ticket_interactions também
DROP POLICY IF EXISTS "Users can read interactions of own tickets" ON ticket_interactions;
DROP POLICY IF EXISTS "Users can create interactions on own tickets" ON ticket_interactions;

CREATE POLICY "Users can read ticket interactions" ON ticket_interactions
  FOR SELECT
  TO authenticated
  USING (
    -- Usuário pode ver interações de seus tickets OU é admin
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_interactions.ticket_id 
      AND (tickets.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      ))
    )
  );

CREATE POLICY "Users can create ticket interactions" ON ticket_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Usuário pode criar interações em seus tickets OU é admin
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_interactions.ticket_id 
      AND (tickets.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      ))
    )
  );

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('tickets', 'ticket_interactions')
ORDER BY tablename, policyname;