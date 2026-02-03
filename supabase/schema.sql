-- ============================================
-- MODOFOCO - COMPLETE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (Extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    whatsapp TEXT,
    photo TEXT,
    focus TEXT[], -- Array of strings
    discovery TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================
-- 2. TASKS (Productivity)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT CHECK (status IN ('todo', 'doing', 'done')) DEFAULT 'todo',
    column_id TEXT, -- Legacy column mapping
    due_date TIMESTAMP WITH TIME ZONE,
    subtasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 3. GOALS
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    status TEXT DEFAULT 'in_progress',
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users can manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 4. STUDY SUBJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.study_subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('college', 'course', 'book', 'other')),
    progress NUMERIC DEFAULT 0,
    total_hours NUMERIC DEFAULT 0,
    last_studied TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own subjects" ON public.study_subjects;
CREATE POLICY "Users can manage own subjects" ON public.study_subjects FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 5. RESOURCES
-- ============================================
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT,
    description TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own resources" ON public.resources;
CREATE POLICY "Users can manage own resources" ON public.resources FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 6. GYM SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.gym_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    focus TEXT,
    duration TEXT,
    time TEXT,
    date DATE,
    recurrence TEXT[],
    exercises JSONB DEFAULT '[]'::jsonb,
    completed BOOLEAN DEFAULT FALSE,
    last_performed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.gym_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own gym sessions" ON public.gym_sessions;
CREATE POLICY "Users can manage own gym sessions" ON public.gym_sessions FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 7. RUN SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.run_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    date DATE,
    time TEXT,
    duration TEXT,
    dist NUMERIC DEFAULT 0,
    calories NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.run_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own runs" ON public.run_sessions;
CREATE POLICY "Users can manage own runs" ON public.run_sessions FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 8. MEALS (Diet)
-- ============================================
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    time TEXT,
    date DATE,
    recurrence TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own meals" ON public.meals;
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 9. GENERAL ROUTINES (Habits)
-- ============================================
CREATE TABLE IF NOT EXISTS public.general_routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    time TEXT,
    icon TEXT,
    days TEXT[],
    steps JSONB DEFAULT '[]'::jsonb,
    completed_dates TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.general_routines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own routines" ON public.general_routines;
CREATE POLICY "Users can manage own routines" ON public.general_routines FOR ALL USING (auth.uid() = user_id);


-- REMOVIDO: FASTING LOGS



-- REMOVIDO: SLEEP LOGS


-- ============================================
-- 12. FINANCE ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    credit_limit NUMERIC DEFAULT 0, -- Limite do Cartão
    account_limit NUMERIC DEFAULT 0, -- Limite da Conta / Cheque Especial
    type TEXT,
    color TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own finance accounts" ON public.finance_accounts;
CREATE POLICY "Users can manage own finance accounts" ON public.finance_accounts FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 13. FINANCE TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')),
    category TEXT,
    date TIMESTAMP WITH TIME ZONE,
    confirmed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.finance_transactions;
CREATE POLICY "Users can manage own transactions" ON public.finance_transactions FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- 14. FINANCE CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.finance_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')),
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own categories" ON public.finance_categories;
CREATE POLICY "Users can manage own categories" ON public.finance_categories FOR ALL USING (auth.uid() = user_id);


-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.study_subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.study_subjects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON public.resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_updated_at ON public.gym_sessions;
CREATE TRIGGER update_gym_updated_at BEFORE UPDATE ON public.gym_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_run_updated_at ON public.run_sessions;
CREATE TRIGGER update_run_updated_at BEFORE UPDATE ON public.run_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_meals_updated_at ON public.meals;
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON public.meals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_routines_updated_at ON public.general_routines;
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.general_routines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_accounts_updated_at ON public.finance_accounts;
CREATE TRIGGER update_finance_accounts_updated_at BEFORE UPDATE ON public.finance_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_transactions_updated_at ON public.finance_transactions;
CREATE TRIGGER update_finance_transactions_updated_at BEFORE UPDATE ON public.finance_transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_categories_updated_at ON public.finance_categories;
CREATE TRIGGER update_finance_categories_updated_at BEFORE UPDATE ON public.finance_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
