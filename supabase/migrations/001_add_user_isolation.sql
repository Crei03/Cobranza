-- ============================================
-- MIGRACIÓN: Aislamiento de datos por usuario
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar columna user_id
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Crear índice para consultas por usuario
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments (user_id);

-- 3. Eliminar política anterior (si existe)
DROP POLICY IF EXISTS "Authenticated user can CRUD payments" ON payments;

-- 4. Nueva política: cada usuario solo ve sus pagos
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Política: cada usuario solo inserta sus pagos
CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Política: cada usuario solo actualiza sus pagos
CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. Política: cada usuario solo elimina sus pagos
CREATE POLICY "Users can delete own payments"
  ON payments FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Política admin: usuario con is_admin=true en metadata puede ver todo
CREATE POLICY "Admin can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
    )
  );

-- 9. Política admin: usuario admin puede actualizar todo
CREATE POLICY "Admin can update all payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
    )
  );

-- 10. Política admin: usuario admin puede eliminar todo
CREATE POLICY "Admin can delete all payments"
  ON payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
    )
  );
