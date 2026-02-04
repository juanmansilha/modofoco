-- Add Gamification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_fp INTEGER DEFAULT 0;

-- Optional: Create a history table for detailed tracking (Server-side logs)
CREATE TABLE IF NOT EXISTS public.gamification_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    type TEXT CHECK (type IN ('earn', 'spend')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gamification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.gamification_history FOR SELECT USING (auth.uid() = user_id);
