-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- helper: trigger to update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles: bağlantı auth.users(id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  locale text,
  currency text DEFAULT 'TRY',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER profiles_set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- accounts / wallets
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL, -- e.g. 'cash','bank','card','wallet'
  currency text NOT NULL DEFAULT 'TRY',
  balance numeric(14,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);

CREATE TRIGGER accounts_set_timestamp
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- categories (can be user-specific or global if user_id IS NULL)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL, -- 'expense' | 'income' | 'transfer'
  color text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);

CREATE TRIGGER categories_set_timestamp
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL, -- for transfers
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TRY',
  type text NOT NULL, -- 'expense' | 'income' | 'transfer'
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON public.transactions(occurred_at);

CREATE TRIGGER transactions_set_timestamp
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- attachments for transactions (files stored in supabase storage; this stores metadata / url)
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE,
  url text NOT NULL,
  file_name text,
  file_size bigint,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_user ON public.attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON public.attachments(transaction_id);

-- tags and join table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.transaction_tags (
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_tags_user ON public.tags(user_id);

-- recurring rules for scheduled transactions
CREATE TABLE IF NOT EXISTS public.recurring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TRY',
  interval text NOT NULL, -- 'daily','weekly','monthly','yearly', or cron-like string
  day_of_month int, -- optional
  start_date date NOT NULL DEFAULT now(),
  end_date date,
  next_run timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user ON public.recurring_rules(user_id);

CREATE TRIGGER recurring_rules_set_timestamp
BEFORE UPDATE ON public.recurring_rules
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);

CREATE TRIGGER budgets_set_timestamp
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Row Level Security: enable and basic policies to allow users to manage their own rows
DO $$
BEGIN
  -- list of tables to enable RLS on
  PERFORM 1 FROM pg_tables WHERE tablename = 'profiles';
  -- enable RLS
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN
  -- ignore if any table doesn't exist yet
  NULL;
END;
$$;

-- Policies
-- profiles: allow user to INSERT a profile for their auth uid and read/update their own profile
CREATE POLICY "profiles_owner" ON public.profiles
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- accounts
CREATE POLICY "accounts_user_only" ON public.accounts
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- categories
CREATE POLICY "categories_user_only" ON public.categories
  USING ( user_id IS NULL OR auth.uid() = user_id )  -- allow global (user_id IS NULL) + owner
  WITH CHECK ( user_id IS NULL OR auth.uid() = user_id );

-- transactions
CREATE POLICY "transactions_user_only" ON public.transactions
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- attachments
CREATE POLICY "attachments_user_only" ON public.attachments
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- tags
CREATE POLICY "tags_user_only" ON public.tags
  USING ( user_id IS NULL OR auth.uid() = user_id )
  WITH CHECK ( user_id IS NULL OR auth.uid() = user_id );

-- transaction_tags: allow ops only if user owns the transaction (checked via subquery)
CREATE POLICY "transaction_tags_user_only" ON public.transaction_tags
  USING ( EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_tags.transaction_id AND t.user_id = auth.uid()) )
  WITH CHECK ( EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_tags.transaction_id AND t.user_id = auth.uid()) );

-- recurring rules
CREATE POLICY "recurring_user_only" ON public.recurring_rules
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- budgets
CREATE POLICY "budgets_user_only" ON public.budgets
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- Allow authenticated users to select/insert on profiles table to create their profile
GRANT USAGE ON SCHEMA public TO authenticated;
-- Note: Supabase's default role names may vary; keep appropriate grants if needed.

-- Optional: example seed categories (global)
INSERT INTO public.categories (id, user_id, name, type, color)
VALUES
  (gen_random_uuid(), NULL, 'Food', 'expense', '#FF6B6B'),
  (gen_random_uuid(), NULL, 'Transport', 'expense', '#4D96FF'),
  (gen_random_uuid(), NULL, 'Salary', 'income', '#2ECC71')
ON CONFLICT DO NOTHING;