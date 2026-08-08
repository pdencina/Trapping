-- =============================================================
-- Tabla de audit logs para acciones admin
-- Ejecutar en Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),       -- Admin que ejecutó la acción
  action TEXT NOT NULL,                                    -- Ej: 'user.approve', 'tasa.update', 'operacion.complete'
  resource_type TEXT NOT NULL,                             -- Ej: 'user', 'operacion', 'tasa', 'cuenta'
  resource_id TEXT NOT NULL,                               -- ID del recurso afectado
  details JSONB DEFAULT NULL,                              -- Datos adicionales (estado anterior, nuevo, etc.)
  ip_address TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- RLS: solo admins pueden leer
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Solo service puede insertar
CREATE POLICY "Service can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Verificación
SELECT 'audit_logs table created' AS status;
