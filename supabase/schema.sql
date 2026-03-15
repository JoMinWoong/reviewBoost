-- ReviewBoost Japan Database Schema

-- Create tables
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- For review-boost.jp/s/[slug]
    google_maps_url TEXT,
    tabelog_url TEXT,
    subscription_status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    taste_rating INTEGER CHECK (taste_rating >= 1 AND taste_rating <= 5),
    customer_name TEXT,
    customer_email TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sentiment_score FLOAT,
    summary TEXT,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public can read active tenants (to show name/logo on landing page)
CREATE POLICY "Public can view tenants" ON tenants FOR SELECT USING (true);

-- Public can submit feedback
CREATE POLICY "Public can submit feedback" ON feedback FOR INSERT WITH CHECK (true);

-- Public can view active coupons for a tenant
CREATE POLICY "Public can view coupons" ON coupons FOR SELECT USING (is_active = true);

-- Merchant policies (Placeholder: will be refined once auth is fully integrated)
-- CREATE POLICY "Merchants can manage their own tenant" ON tenants ...
