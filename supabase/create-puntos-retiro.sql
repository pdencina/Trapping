-- =============================================================
-- Tabla de puntos de retiro (pick-up) por país/ciudad
-- Ejecutar en Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS puntos_retiro (
  id SERIAL PRIMARY KEY,
  pais_id INT NOT NULL REFERENCES paises(id),
  ciudad TEXT NOT NULL,
  nombre TEXT NOT NULL,                          -- Nombre del punto o agencia
  direccion TEXT NOT NULL,
  referencia TEXT DEFAULT NULL,                   -- Referencia para ubicar el local
  horario TEXT DEFAULT NULL,                      -- Ej: "Lunes a Viernes 9:00 - 17:00"
  telefono TEXT DEFAULT NULL,
  moneda TEXT NOT NULL DEFAULT 'VES',            -- Moneda en que se entrega
  monto_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
  monto_maximo NUMERIC(12,2) NOT NULL DEFAULT 0, -- 0 = sin límite
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_puntos_retiro_pais ON puntos_retiro(pais_id);
CREATE INDEX IF NOT EXISTS idx_puntos_retiro_ciudad ON puntos_retiro(ciudad);
CREATE INDEX IF NOT EXISTS idx_puntos_retiro_activo ON puntos_retiro(activo) WHERE activo = true;

-- RLS
ALTER TABLE puntos_retiro ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer puntos activos
CREATE POLICY "Anyone can read active pickup points"
  ON puntos_retiro FOR SELECT
  USING (activo = true AND deleted_at IS NULL);

-- Solo service_role puede modificar
CREATE POLICY "Service role can manage pickup points"
  ON puntos_retiro FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── SEED: Puntos de ejemplo ──────────────────────────────────

-- Venezuela
DO $$
DECLARE
  ve_id INT;
BEGIN
  SELECT id INTO ve_id FROM paises WHERE siglas = 'VE' OR nombre_pais ILIKE '%venezuel%' LIMIT 1;
  
  IF ve_id IS NOT NULL THEN
    INSERT INTO puntos_retiro (pais_id, ciudad, nombre, direccion, referencia, horario, telefono, moneda) VALUES
      (ve_id, 'Caracas', 'Agencia Centro Caracas', 'Av. Urdaneta, Edif. Centro, PB Local 4', 'Frente al Metro Capitolio', 'Lun-Vie 8:30-16:00', '+58 212-555-0101', 'VES'),
      (ve_id, 'Caracas', 'Agencia Chacao', 'Av. Francisco de Miranda, CC Lido, Nivel PB', 'Al lado de la farmacia', 'Lun-Sab 9:00-17:00', '+58 212-555-0102', 'VES'),
      (ve_id, 'Maracaibo', 'Agencia Maracaibo Norte', 'Av. 5 de Julio, CC Lago Mall, Local 22', 'Entrada por estacionamiento', 'Lun-Vie 8:30-15:30', '+58 261-555-0201', 'VES'),
      (ve_id, 'Valencia', 'Agencia Valencia Centro', 'Av. Bolívar Norte, Torre Banaven, PB', 'Al lado del banco provincial', 'Lun-Vie 9:00-16:00', '+58 241-555-0301', 'VES'),
      (ve_id, 'Barquisimeto', 'Agencia Barquisimeto', 'Carrera 19 entre calles 31 y 32, Local 5', NULL, 'Lun-Vie 8:30-15:00', '+58 251-555-0401', 'VES')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Colombia
DO $$
DECLARE
  co_id INT;
BEGIN
  SELECT id INTO co_id FROM paises WHERE siglas = 'CO' OR nombre_pais ILIKE '%colomb%' LIMIT 1;
  
  IF co_id IS NOT NULL THEN
    INSERT INTO puntos_retiro (pais_id, ciudad, nombre, direccion, referencia, horario, telefono, moneda) VALUES
      (co_id, 'Bogotá', 'Punto Efecty Chapinero', 'Cra. 13 #53-24, Chapinero', 'Centro comercial La 53', 'Lun-Sab 8:00-18:00', '+57 1-555-0101', 'COP'),
      (co_id, 'Bogotá', 'Punto Efecty Centro', 'Calle 19 #4-62, Centro', 'Al lado del éxito', 'Lun-Sab 8:00-17:00', '+57 1-555-0102', 'COP'),
      (co_id, 'Medellín', 'Punto Efecty El Poblado', 'Cra. 43A #6 Sur-15, El Poblado', NULL, 'Lun-Sab 8:00-18:00', '+57 4-555-0201', 'COP'),
      (co_id, 'Cali', 'Punto Efecty Ciudad Jardín', 'Calle 16 #100-40, Ciudad Jardín', 'Frente al parque', 'Lun-Vie 8:00-17:00', '+57 2-555-0301', 'COP')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Verificación
SELECT 'Puntos de retiro creados' AS status, COUNT(*)::text AS total FROM puntos_retiro;
