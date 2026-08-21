CREATE TABLE public.rate_limits (
    client_id text PRIMARY KEY,
    window_start timestamptz NOT NULL DEFAULT now(),
    call_count integer NOT NULL DEFAULT 0
);

GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all direct access"
ON public.rate_limits
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);