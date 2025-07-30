-- Crear tabla de usuarios extendida
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de salarios mensuales
CREATE TABLE IF NOT EXISTS public.monthly_salaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, month, year)
);

-- Crear tabla de gastos regulares
CREATE TABLE IF NOT EXISTS public.regular_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  description VARCHAR NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category VARCHAR NOT NULL DEFAULT 'otros',
  payment_date INTEGER NOT NULL CHECK (payment_date >= 1 AND payment_date <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de gastos esporádicos
CREATE TABLE IF NOT EXISTS public.sporadic_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  description VARCHAR NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category VARCHAR NOT NULL DEFAULT 'otros',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de préstamos pendientes
CREATE TABLE IF NOT EXISTS public.pending_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  description VARCHAR NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de wishlist
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item VARCHAR NOT NULL,
  price DECIMAL(12,2) NOT NULL CHECK (price > 0),
  priority VARCHAR NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  category VARCHAR NOT NULL DEFAULT 'otros',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_regular_expenses_user_id ON public.regular_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_sporadic_expenses_user_id ON public.sporadic_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_sporadic_expenses_date ON public.sporadic_expenses(date);
CREATE INDEX IF NOT EXISTS idx_pending_loans_user_id ON public.pending_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_salaries_user_id ON public.monthly_salaries(user_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regular_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sporadic_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Políticas para tabla users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para monthly_salaries
CREATE POLICY "Users can manage own salaries" ON public.monthly_salaries
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para regular_expenses
CREATE POLICY "Users can manage own regular expenses" ON public.regular_expenses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para sporadic_expenses
CREATE POLICY "Users can manage own sporadic expenses" ON public.sporadic_expenses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para pending_loans
CREATE POLICY "Users can manage own loans" ON public.pending_loans
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para wishlist_items
CREATE POLICY "Users can manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_monthly_salaries_updated_at BEFORE UPDATE ON public.monthly_salaries
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_regular_expenses_updated_at BEFORE UPDATE ON public.regular_expenses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pending_loans_updated_at BEFORE UPDATE ON public.pending_loans
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON public.wishlist_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevo usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

