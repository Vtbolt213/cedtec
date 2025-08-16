/*
  # Add foreign key relationship between ticket_interactions and profiles

  1. Changes
    - Add foreign key constraint between ticket_interactions.user_id and profiles.id
    - This will allow Supabase to resolve the relationship in queries

  2. Security
    - No changes to existing RLS policies
*/

-- Add foreign key constraint between ticket_interactions and profiles
ALTER TABLE ticket_interactions 
ADD CONSTRAINT fk_ticket_interactions_user_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the constraint was created
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
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='ticket_interactions'
  AND tc.constraint_name='fk_ticket_interactions_user_profiles';