-- Adicionar colunas de Gamificação à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_fp INTEGER DEFAULT 0;

-- Opcional: Criar uma tabela de histórico para rastreamento detalhado (logs do lado do servidor)
CREATE TABLE IF NOT EXISTS public.gamification_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    type TEXT CHECK (type IN ('earn', 'spend')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Segurança em Nível de Linha)
ALTER TABLE public.gamification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.gamification_history FOR SELECT USING (auth.uid() = user_id);
