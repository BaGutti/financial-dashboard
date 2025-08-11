-- Agregar campo 'paid' a gastos regulares para rastrear cuáles han sido pagados
ALTER TABLE public.regular_expenses 
ADD COLUMN paid BOOLEAN NOT NULL DEFAULT false;

-- Agregar campo para la fecha en que se pagó (opcional)
ALTER TABLE public.regular_expenses 
ADD COLUMN paid_date DATE NULL;

-- Crear índice para consultas por estado de pago
CREATE INDEX IF NOT EXISTS idx_regular_expenses_paid ON public.regular_expenses(paid);

-- Función para resetear automáticamente los gastos regulares al inicio de cada mes
CREATE OR REPLACE FUNCTION reset_monthly_payments()
RETURNS void AS $$
BEGIN
  -- Resetear todos los gastos regulares el primer día del mes
  UPDATE public.regular_expenses 
  SET paid = false, paid_date = NULL
  WHERE paid = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear tabla para registrar cuando se ejecutó el reset (para evitar múltiples resets)
CREATE TABLE IF NOT EXISTS public.monthly_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reset_month INTEGER NOT NULL,
  reset_year INTEGER NOT NULL,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(reset_month, reset_year)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.monthly_resets ENABLE ROW LEVEL SECURITY;

-- Política para que solo el sistema pueda gestionar los resets
CREATE POLICY "System can manage monthly resets" ON public.monthly_resets
  FOR ALL USING (true);