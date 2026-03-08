
-- Recreate profiles_public view as security_definer so it bypasses profiles RLS
-- This is safe because the view only exposes non-sensitive public columns
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=off) AS
  SELECT id, username, avatar_url, is_verified, created_at
  FROM public.profiles;

-- Grant access to anon and authenticated
GRANT SELECT ON public.profiles_public TO anon, authenticated;
