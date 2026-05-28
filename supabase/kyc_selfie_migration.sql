-- Agregar campo selfie a kyc_sessions
ALTER TABLE kyc_sessions ADD COLUMN IF NOT EXISTS selfie_path TEXT;

-- Actualizar el CHECK de status para incluir selfie_done
ALTER TABLE kyc_sessions DROP CONSTRAINT IF EXISTS kyc_sessions_status_check;
ALTER TABLE kyc_sessions ADD CONSTRAINT kyc_sessions_status_check 
  CHECK (status IN ('pending', 'front_done', 'back_done', 'selfie_done', 'completed', 'expired'));
