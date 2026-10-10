-- Fresh-install schema. Existing projects should apply the matching migration in
-- supabase/migrations instead of rerunning CREATE TABLE statements manually.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  google_maps_url text,
  tabelog_url text,
  subscription_status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 2000),
  staff_rating integer CHECK (staff_rating BETWEEN 1 AND 5),
  atmosphere_rating integer CHECK (atmosphere_rating BETWEEN 1 AND 5),
  quality_rating integer CHECK (quality_rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  code text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sentiment_score double precision,
  summary text,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  period_start timestamptz,
  period_end timestamptz
);

CREATE INDEX IF NOT EXISTS feedback_tenant_created_at_idx
  ON public.feedback (tenant_id, created_at DESC);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tenant info by slug" ON public.tenants;
DROP POLICY IF EXISTS "Owners can manage their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Owners can manage their tenants" ON public.tenants;
DROP POLICY IF EXISTS "Owners can read their tenants" ON public.tenants;
DROP POLICY IF EXISTS "Owners can view their feedback" ON public.feedback;
DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Owners can read their feedback" ON public.feedback;
DROP POLICY IF EXISTS "Public can view coupons" ON public.coupons;
DROP POLICY IF EXISTS "Owners can manage their coupons" ON public.coupons;
DROP POLICY IF EXISTS "Owners can read their analytics" ON public.analytics;
DROP POLICY IF EXISTS "Owners can save their analytics" ON public.analytics;

CREATE POLICY "Owners can read their tenants" ON public.tenants
  FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can read their feedback" ON public.feedback
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.owner_id = (SELECT auth.uid()))
  );
CREATE POLICY "Owners can read their analytics" ON public.analytics
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.owner_id = (SELECT auth.uid()))
  );
CREATE POLICY "Owners can save their analytics" ON public.analytics
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.owner_id = (SELECT auth.uid()))
  );

REVOKE ALL ON public.tenants, public.feedback, public.coupons, public.analytics FROM anon, authenticated;
GRANT SELECT ON public.tenants, public.feedback TO authenticated;
GRANT SELECT, INSERT ON public.analytics TO authenticated;

-- Expose only the fields used by the public feedback page, never owner IDs or metadata.
CREATE OR REPLACE VIEW public.public_tenants WITH (security_barrier = true) AS
  SELECT id, slug, name, google_maps_url, tabelog_url
  FROM public.tenants
  WHERE subscription_status = 'active';
GRANT SELECT ON public.public_tenants TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_feedback(
  p_tenant_id uuid,
  p_rating integer,
  p_comment text DEFAULT NULL,
  p_staff_rating integer DEFAULT NULL,
  p_atmosphere_rating integer DEFAULT NULL,
  p_quality_rating integer DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_rating IS NULL OR p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Invalid rating';
  END IF;
  IF p_comment IS NOT NULL AND char_length(p_comment) > 2000 THEN
    RAISE EXCEPTION 'Comment too long';
  END IF;
  IF (p_staff_rating IS NOT NULL AND p_staff_rating NOT BETWEEN 1 AND 5)
     OR (p_atmosphere_rating IS NOT NULL AND p_atmosphere_rating NOT BETWEEN 1 AND 5)
     OR (p_quality_rating IS NOT NULL AND p_quality_rating NOT BETWEEN 1 AND 5) THEN
    RAISE EXCEPTION 'Invalid detail rating';
  END IF;
  IF p_rating <= 3 AND (p_staff_rating IS NULL OR p_atmosphere_rating IS NULL OR p_quality_rating IS NULL) THEN
    RAISE EXCEPTION 'Detail ratings required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = p_tenant_id AND subscription_status = 'active') THEN
    RAISE EXCEPTION 'Tenant unavailable';
  END IF;

  INSERT INTO public.feedback (tenant_id, rating, comment, staff_rating, atmosphere_rating, quality_rating)
  VALUES (p_tenant_id, p_rating, NULLIF(btrim(p_comment), ''), p_staff_rating, p_atmosphere_rating, p_quality_rating);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_feedback(uuid, integer, text, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_feedback(uuid, integer, text, integer, integer, integer) TO anon, authenticated;
