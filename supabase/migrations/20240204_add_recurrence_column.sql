-- Add recurrence column to finance_transactions table
ALTER TABLE public.finance_transactions 
ADD COLUMN IF NOT EXISTS recurrence JSONB DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN public.finance_transactions.recurrence IS 'Stores recurrence details: { frequency: "monthly"|"weekly"|"daily", type: "fixed"|"indefinite", installments: number }';
