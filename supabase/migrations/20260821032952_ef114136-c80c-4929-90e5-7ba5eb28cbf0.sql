CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE TABLE public.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id text NOT NULL,
    access_token uuid NOT NULL DEFAULT gen_random_uuid(),
    started_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    completed boolean NOT NULL DEFAULT false,
    abandoned_at text,
    app_version text,
    user_agent text,
    reflection text,
    selections jsonb NOT NULL DEFAULT '[]'::jsonb,
    transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
    events jsonb NOT NULL DEFAULT '[]'::jsonb,
    decision_text jsonb NOT NULL DEFAULT '{}'::jsonb,
    classification jsonb NOT NULL DEFAULT '{}'::jsonb,
    category_edits jsonb NOT NULL DEFAULT '{}'::jsonb,
    ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
    weights jsonb NOT NULL DEFAULT '{}'::jsonb,
    gut_check jsonb NOT NULL DEFAULT '{}'::jsonb,
    durations jsonb NOT NULL DEFAULT '{}'::jsonb
);

GRANT ALL ON public.sessions TO service_role;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all direct access"
ON public.sessions
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);