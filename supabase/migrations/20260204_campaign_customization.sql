-- Add image, icon, and style columns to marketing_campaigns
ALTER TABLE public.marketing_campaigns
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS style JSONB DEFAULT '{}'::jsonb;
