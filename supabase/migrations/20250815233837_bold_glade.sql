/*
  # Adicionar foreign key constraint entre tickets e profiles

  1. Alterações
    - Adiciona constraint de foreign key entre tickets.user_id e profiles.id
    - Permite que o Supabase resolva automaticamente o relacionamento nas queries

  2. Segurança
    - Mantém as políticas RLS existentes
    - Garante integridade referencial dos dados
*/

-- Adicionar foreign key constraint entre tickets e profiles
ALTER TABLE tickets 
ADD CONSTRAINT fk_tickets_user_id 
FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE;

-- Verificar se a constraint foi criada corretamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'tickets';