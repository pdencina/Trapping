-- =============================================================
-- SEED: Agregar España como corredor destino con moneda EUR
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- 1. Agregar país España (si no existe)
INSERT INTO paises (nombre_pais, siglas, estatus)
VALUES ('España', 'ES', true)
ON CONFLICT DO NOTHING;

-- 2. Agregar moneda EUR vinculada a España
INSERT INTO monedas (pais_id, moneda, acronimo, icono, bank_origen, bank_destino)
SELECT id, 'Euro', 'EUR', '€', false, true
FROM paises WHERE siglas = 'ES'
ON CONFLICT DO NOTHING;

-- 3. Agregar bancos españoles principales
DO $$
DECLARE
  spain_id INT;
BEGIN
  SELECT id INTO spain_id FROM paises WHERE siglas = 'ES' LIMIT 1;
  
  IF spain_id IS NOT NULL THEN
    INSERT INTO bancos (codigo, nombre_banco, pais_id, swift) VALUES
      ('0049', 'Banco Santander España', spain_id, 'BSCHESMM'),
      ('2100', 'CaixaBank', spain_id, 'CABOREST'),
      ('0182', 'BBVA España', spain_id, 'BBVAESMM'),
      ('0081', 'Banco Sabadell', spain_id, 'BSABESBB'),
      ('2038', 'Bankia (CaixaBank)', spain_id, 'CAABOREST'),
      ('0128', 'Bankinter', spain_id, 'BKBKESMM'),
      ('0073', 'Open Bank', spain_id, 'OPENESMM'),
      ('0075', 'Banco Popular (Santander)', spain_id, 'POPUESMM'),
      ('2085', 'IberCaja', spain_id, 'CAZRES2Z'),
      ('0487', 'N26 España', spain_id, NULL),
      ('0234', 'Revolut España', spain_id, NULL),
      ('6789', 'Wise (TransferWise)', spain_id, NULL)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 4. Agregar tasa CLP → EUR (valor de ejemplo, ajustar según tasa real del día)
-- Ejemplo: 1 CLP = 0.00001 EUR (aprox. $950 CLP = 1 EUR)
INSERT INTO tasas (moneda_origen, moneda_destino, valor, monto_minimo, monto_maximo, impuesto_moneda_origen, activo)
VALUES ('CLP', 'EUR', 0.00100529, 50000, 5000000, 19, true)
ON CONFLICT DO NOTHING;

-- 5. Verificación
SELECT 'Países:' AS tabla, COUNT(*)::text AS total FROM paises WHERE siglas = 'ES'
UNION ALL
SELECT 'Moneda EUR:', COUNT(*)::text FROM monedas WHERE acronimo = 'EUR'
UNION ALL
SELECT 'Bancos España:', COUNT(*)::text FROM bancos b JOIN paises p ON b.pais_id = p.id WHERE p.siglas = 'ES'
UNION ALL
SELECT 'Tasa CLP→EUR:', COUNT(*)::text FROM tasas WHERE moneda_origen = 'CLP' AND moneda_destino = 'EUR' AND activo = true;
