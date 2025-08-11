-- Mejoras al sistema de préstamos
-- Agregar nuevas columnas a la tabla pending_loans

-- Agregar columna para cantidad pagada
ALTER TABLE pending_loans 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0 CHECK (amount_paid >= 0);

-- Agregar columna de estado
ALTER TABLE pending_loans 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'overdue', 'partial', 'completed', 'lost'));

-- Crear tabla para pagos de préstamos
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  loan_id UUID REFERENCES public.pending_loans(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(payment_date);

-- RLS Policies para loan_payments
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own loan payments
CREATE POLICY "Users can view their own loan payments" ON loan_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own loan payments
CREATE POLICY "Users can insert their own loan payments" ON loan_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own loan payments
CREATE POLICY "Users can update their own loan payments" ON loan_payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own loan payments
CREATE POLICY "Users can delete their own loan payments" ON loan_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar automáticamente el estado del préstamo
CREATE OR REPLACE FUNCTION update_loan_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el amount_paid del préstamo
  UPDATE pending_loans 
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM loan_payments 
      WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id)
    ),
    status = CASE 
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM loan_payments WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id)) >= amount THEN 'completed'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM loan_payments WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id)) > 0 THEN 'partial'
      WHEN expected_date IS NOT NULL AND expected_date < CURRENT_DATE THEN 'overdue'
      ELSE 'pending'
    END,
    updated_at = timezone('utc'::text, now())
  WHERE id = COALESCE(NEW.loan_id, OLD.loan_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado automáticamente
DROP TRIGGER IF EXISTS trigger_update_loan_status ON loan_payments;
CREATE TRIGGER trigger_update_loan_status
  AFTER INSERT OR UPDATE OR DELETE ON loan_payments
  FOR EACH ROW EXECUTE FUNCTION update_loan_status();

-- Actualizar préstamos existentes para establecer estado inicial
UPDATE pending_loans 
SET 
  amount_paid = 0,
  status = CASE 
    WHEN expected_date IS NOT NULL AND expected_date < CURRENT_DATE THEN 'overdue'
    ELSE 'pending'
  END
WHERE amount_paid IS NULL OR status IS NULL;