-- =============================================================
-- Sistema de referidos para Trapping
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- Tabla de códigos de referido (cada usuario tiene uno)
CREATE TABLE IF NOT EXISTS referral_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,                     -- Código único del usuario (ej: PABLO-X4K9)
  uses_count INT NOT NULL DEFAULT 0,            -- Veces que fue usado
  max_uses INT DEFAULT NULL,                     -- NULL = sin límite
  reward_percent NUMERIC(5,2) NOT NULL DEFAULT 100, -- % de descuento en comisión para el referido
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de referidos aplicados (tracking)
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id),       -- Quien refirió
  referred_id UUID NOT NULL UNIQUE REFERENCES auth.users(id), -- Quien fue referido (solo 1 vez)
  code TEXT NOT NULL,                                          -- Código usado
  status TEXT NOT NULL DEFAULT 'pending',                      -- pending, active, expired
  operations_with_discount INT NOT NULL DEFAULT 0,            -- Ops con descuento usadas
  max_discount_operations INT NOT NULL DEFAULT 3,             -- Máx ops con descuento
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 100,         -- % descuento en comisión
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ DEFAULT NULL,                       -- Cuando el referido hizo su primera op
  expired_at TIMESTAMPTZ DEFAULT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver su propio código
CREATE POLICY "Users can view own referral code"
  ON referral_codes FOR SELECT USING (auth.uid() = user_id);

-- Todos pueden verificar si un código existe (para validar al registrarse)
CREATE POLICY "Anyone can check code existence"
  ON referral_codes FOR SELECT USING (active = true);

-- Usuarios pueden ver sus propios referidos
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Solo service puede insertar/modificar
CREATE POLICY "Service can manage referral codes"
  ON referral_codes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage referrals"
  ON referrals FOR ALL USING (true) WITH CHECK (true);

-- Agregar columna referral_code al profile (código del referidor que usó al registrarse)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referred_by_code') THEN
    ALTER TABLE profiles ADD COLUMN referred_by_code TEXT DEFAULT NULL;
  END IF;
END $$;

-- Verificación
SELECT 'referral_codes' AS tabla, 'created' AS status
UNION ALL
SELECT 'referrals', 'created';
