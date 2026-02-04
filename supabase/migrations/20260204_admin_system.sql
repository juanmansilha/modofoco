-- Create ENUM for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin', 'support', 'marketing', 'finance');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user';

-- Create Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('popup', 'banner', 'toast', 'modal')),
    title TEXT,
    content TEXT,
    cta_text TEXT,
    cta_link TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience JSONB DEFAULT '{}'::jsonb, -- Store targeting rules (plan, level, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('bug', 'question', 'billing', 'other')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Ticket Messages Table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- For admin notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create System Logs Table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'critical')),
    source TEXT NOT NULL, -- e.g., 'backend', 'payment_webhook', 'falcon_ai'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Admin Audit Logs Table (Strict logging for critical actions)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- e.g., 'ban_user', 'refund_transaction', 'edit_campaign'
    target_resource TEXT NOT NULL, -- e.g., 'user:123', 'campaign:456'
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to campaigns" ON public.marketing_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'marketing')
        )
    );

-- Policy: Users can read active campaigns
CREATE POLICY "Users can view active campaigns" ON public.marketing_campaigns
    FOR SELECT USING (status = 'active');

-- Support Tickets Policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support')
        )
    );

-- Logs: Only admins can view
CREATE POLICY "Admins can view system logs" ON public.system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert logs" ON public.system_logs
    FOR INSERT WITH CHECK (true); -- Usually handled by service role, but allowing authenticated users to log errors (optional, maybe restrict later)

-- Audit Logs: Read only for admins, Insert only
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );
