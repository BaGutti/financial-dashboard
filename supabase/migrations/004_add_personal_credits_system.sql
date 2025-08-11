-- Sistema de créditos/deudas propias (dinero que YO debo)
-- Ejemplo: créditos bancarios, préstamos personales, tarjetas de crédito, etc.

-- Tabla principal de créditos (información general del crédito/deuda)
CREATE TABLE IF NOT EXISTS public.personal_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Información básica
  name VARCHAR NOT NULL, -- "Crédito Bancolombia", "Tarjeta Visa", etc.
  description TEXT,
  
  -- Información financiera
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0), -- Monto total del crédito
  remaining_amount DECIMAL(12,2) NOT NULL CHECK (remaining_amount >= 0), -- Lo que aún debo
  monthly_payment DECIMAL(12,2) NOT NULL CHECK (monthly_payment > 0), -- Cuota mensual
  interest_rate DECIMAL(5,2) DEFAULT 0, -- Tasa de interés anual (opcional)
  
  -- Fechas importantes
  start_date DATE NOT NULL, -- Fecha de inicio del crédito
  end_date DATE, -- Fecha estimada de finalización (opcional)
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 31), -- Día del mes para pagar
  
  -- Estado y categorización
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue', 'paused')),
  category VARCHAR NOT NULL DEFAULT 'personal' CHECK (category IN ('personal', 'mortgage', 'car', 'credit_card', 'education', 'business', 'other')),
  priority VARCHAR NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de pagos realizados para los créditos
CREATE TABLE IF NOT EXISTS public.credit_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  credit_id UUID REFERENCES public.personal_credits(id) ON DELETE CASCADE NOT NULL,
  
  -- Información del pago
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL, -- Fecha de vencimiento de esta cuota
  
  -- Desglose del pago (opcional para análisis)
  principal_amount DECIMAL(12,2) DEFAULT 0, -- Parte que va al capital
  interest_amount DECIMAL(12,2) DEFAULT 0, -- Parte que va a intereses
  fees_amount DECIMAL(12,2) DEFAULT 0, -- Comisiones o cargos adicionales
  
  -- Estado y notas
  status VARCHAR NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'late')),
  description TEXT, -- Notas adicionales
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de cuotas programadas (para tracking de pagos futuros)
CREATE TABLE IF NOT EXISTS public.credit_installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  credit_id UUID REFERENCES public.personal_credits(id) ON DELETE CASCADE NOT NULL,
  
  -- Información de la cuota
  installment_number INTEGER NOT NULL, -- Número de cuota (1, 2, 3...)
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  
  -- Estado de pago
  is_paid BOOLEAN NOT NULL DEFAULT false,
  payment_id UUID REFERENCES public.credit_payments(id) ON DELETE SET NULL, -- Link al pago si existe
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(credit_id, installment_number)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_personal_credits_user_id ON public.personal_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_credits_status ON public.personal_credits(status);
CREATE INDEX IF NOT EXISTS idx_personal_credits_payment_day ON public.personal_credits(payment_day);

CREATE INDEX IF NOT EXISTS idx_credit_payments_user_id ON public.credit_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_id ON public.credit_payments(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_date ON public.credit_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_credit_installments_user_id ON public.credit_installments(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_installments_credit_id ON public.credit_installments(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_installments_due_date ON public.credit_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_credit_installments_unpaid ON public.credit_installments(is_paid) WHERE is_paid = false;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.personal_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_installments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can manage own personal credits" ON public.personal_credits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own credit payments" ON public.credit_payments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own credit installments" ON public.credit_installments
  FOR ALL USING (auth.uid() = user_id);

-- Trigger para updated_at en personal_credits
CREATE TRIGGER update_personal_credits_updated_at 
  BEFORE UPDATE ON public.personal_credits
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para generar cuotas automáticamente cuando se crea un crédito
CREATE OR REPLACE FUNCTION generate_credit_installments()
RETURNS TRIGGER AS $$
DECLARE
  installment_date DATE;
  installment_count INTEGER;
  i INTEGER := 1;
BEGIN
  -- Solo generar cuotas para créditos activos con fecha de fin
  IF NEW.status = 'active' AND NEW.end_date IS NOT NULL THEN
    -- Calcular número aproximado de cuotas
    installment_count := EXTRACT(MONTHS FROM age(NEW.end_date, NEW.start_date));
    
    -- Generar cuotas mensuales
    installment_date := NEW.start_date;
    
    WHILE installment_date <= NEW.end_date AND i <= 120 LOOP -- Max 120 cuotas (10 años)
      -- Ajustar al día de pago del mes
      installment_date := DATE_TRUNC('month', installment_date) + (NEW.payment_day - 1) * INTERVAL '1 day';
      
      -- Si el día de pago es mayor que los días del mes, usar el último día
      IF EXTRACT(DAY FROM (DATE_TRUNC('month', installment_date) + INTERVAL '1 month' - INTERVAL '1 day')) < NEW.payment_day THEN
        installment_date := DATE_TRUNC('month', installment_date) + INTERVAL '1 month' - INTERVAL '1 day';
      END IF;
      
      -- Insertar cuota
      INSERT INTO public.credit_installments (
        user_id, 
        credit_id, 
        installment_number, 
        due_date, 
        amount
      ) VALUES (
        NEW.user_id,
        NEW.id,
        i,
        installment_date,
        NEW.monthly_payment
      );
      
      i := i + 1;
      installment_date := installment_date + INTERVAL '1 month';
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para generar cuotas automáticamente
CREATE TRIGGER generate_installments_on_credit_creation
  AFTER INSERT ON public.personal_credits
  FOR EACH ROW EXECUTE PROCEDURE generate_credit_installments();

-- Función para actualizar remaining_amount cuando se hace un pago
CREATE OR REPLACE FUNCTION update_credit_remaining_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el monto restante del crédito
  UPDATE public.personal_credits 
  SET 
    remaining_amount = remaining_amount - NEW.principal_amount,
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.credit_id;
  
  -- Marcar la cuota correspondiente como pagada si existe
  UPDATE public.credit_installments 
  SET 
    is_paid = true,
    payment_id = NEW.id
  WHERE credit_id = NEW.credit_id 
    AND due_date = NEW.due_date 
    AND is_paid = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar remaining_amount cuando se registra un pago
CREATE TRIGGER update_remaining_on_payment
  AFTER INSERT ON public.credit_payments
  FOR EACH ROW EXECUTE PROCEDURE update_credit_remaining_amount();