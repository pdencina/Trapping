-- =============================================================
-- Tabla de límites operacionales por tier de usuario
-- Ejecutar en Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS limites_operacionales (
  id SERIAL PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE DEFAULT 'standard',  -- standard, premium, vip
  descripcion TEXT,
  -- Límites diarios
  max_operaciones_dia INT NOT NULL DEFAULT 5,
  max_monto_dia_clp NUMERIC(12,2) NOT NULL DEFAULT 2000000,      -- 2M CLP/día
  -- Límites mensuales
  max_operaciones_mes INT NOT NULL DEFAULT 30,
  max_monto_mes_clp NUMERIC(12,2) NOT NULL DEFAULT 10000000,     -- 10M CLP/mes
  -- Límites por operación individual
  max_monto_operacion_clp NUMERIC(12,2) NOT NULL DEFAULT 1000000, -- 1M CLP por operación
  -- Metadata
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agregar columna tier al profile si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tier') THEN
    ALTER TABLE profiles ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';
  END IF;
END $$;

-- Seed: tiers por defecto
INSERT INTO limites_operacionales (tier, descripcion, max_operaciones_dia, max_monto_dia_clp, max_operaciones_mes, max_monto_mes_clp, max_monto_operacion_clp)
VALUES
  ('standard', 'Usuario estándar recién verificado', 5, 2000000, 30, 10000000, 1000000),
  ('premium', 'Usuario frecuente con historial positivo', 10, 5000000, 60, 30000000, 3000000),
  ('vip', 'Usuario VIP sin restricciones operativas', 50, 50000000, 200, 100000000, 10000000)
ON CONFLICT (tier) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  max_operaciones_dia = EXCLUDED.max_operaciones_dia,
  max_monto_dia_clp = EXCLUDED.max_monto_dia_clp,
  max_operaciones_mes = EXCLUDED.max_operaciones_mes,
  max_monto_mes_clp = EXCLUDED.max_monto_mes_clp,
  max_monto_operacion_clp = EXCLUDED.max_monto_operacion_clp,
  updated_at = now();

-- RLS
ALTER TABLE limites_operacionales ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer los límites (necesario para mostrar en frontend)
CREATE POLICY "Anyone can read limits"
  ON limites_operacionales FOR SELECT
  USING (true);

-- Verificación
SELECT tier, max_operaciones_dia, max_monto_dia_clp, max_operaciones_mes, max_monto_mes_clp
FROM limites_operacionales ORDER BY max_monto_dia_clp;
