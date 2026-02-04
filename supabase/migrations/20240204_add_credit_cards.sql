-- ============================================
-- MÓDULO DE CARTÕES DE CRÉDITO E FATURAS
-- ============================================

-- 1. Adicionar campo is_primary à tabela finance_accounts (Conta Principal)
ALTER TABLE public.finance_accounts 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- 2. Adicionar campos de método de pagamento à tabela finance_transactions
ALTER TABLE public.finance_transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'debit' CHECK (payment_method IN ('debit', 'credit')),
ADD COLUMN IF NOT EXISTS credit_card_id UUID,
ADD COLUMN IF NOT EXISTS invoice_id UUID,
ADD COLUMN IF NOT EXISTS installment_number INTEGER,
ADD COLUMN IF NOT EXISTS total_installments INTEGER;

-- 3. Criar tabela de Cartões de Crédito
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bank_account_id UUID REFERENCES public.finance_accounts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    credit_limit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    available_limit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    color TEXT DEFAULT '#6366f1',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de Faturas de Cartão de Crédito
CREATE TABLE IF NOT EXISTS public.credit_card_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reference_month DATE NOT NULL, -- Primeiro dia do mês de referência
    start_date DATE NOT NULL,      -- Data de início do período da fatura
    end_date DATE NOT NULL,        -- Data de fim do período da fatura
    due_date DATE NOT NULL,        -- Data de vencimento
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid', 'partial', 'overdue')),
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_from_account_id UUID REFERENCES public.finance_accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Adicionar FK de credit_card_id e invoice_id em transactions
ALTER TABLE public.finance_transactions 
ADD CONSTRAINT fk_credit_card FOREIGN KEY (credit_card_id) REFERENCES public.credit_cards(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES public.credit_card_invoices(id) ON DELETE SET NULL;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON public.credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_bank_account ON public.credit_cards(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_credit_card ON public.credit_card_invoices(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.credit_card_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.credit_card_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_reference_month ON public.credit_card_invoices(reference_month);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_card ON public.finance_transactions(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.finance_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON public.finance_transactions(payment_method);

-- 7. Habilitar RLS (Row Level Security)
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_invoices ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de segurança para credit_cards
CREATE POLICY "Users can view own credit cards" 
ON public.credit_cards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credit cards" 
ON public.credit_cards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" 
ON public.credit_cards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" 
ON public.credit_cards FOR DELETE 
USING (auth.uid() = user_id);

-- 9. Políticas de segurança para credit_card_invoices
CREATE POLICY "Users can view own invoices" 
ON public.credit_card_invoices FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices" 
ON public.credit_card_invoices FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" 
ON public.credit_card_invoices FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" 
ON public.credit_card_invoices FOR DELETE 
USING (auth.uid() = user_id);

-- 10. Função para garantir apenas uma conta principal por usuário
CREATE OR REPLACE FUNCTION ensure_single_primary_account()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE public.finance_accounts 
        SET is_primary = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_primary = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para conta principal
DROP TRIGGER IF EXISTS trigger_single_primary_account ON public.finance_accounts;
CREATE TRIGGER trigger_single_primary_account
BEFORE INSERT OR UPDATE ON public.finance_accounts
FOR EACH ROW
EXECUTE FUNCTION ensure_single_primary_account();

-- 11. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_credit_cards_updated_at ON public.credit_cards;
CREATE TRIGGER trigger_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON public.credit_card_invoices;
CREATE TRIGGER trigger_invoices_updated_at
BEFORE UPDATE ON public.credit_card_invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
