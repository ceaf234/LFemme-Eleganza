-- ============================================
-- L'Femme Eleganza — Row Level Security Policies
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE: services
-- Public: can read active services (booking flow)
-- Authenticated: full CRUD (admin panel)
-- ============================================
CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated users have full access to services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: staff
-- Public: can read active staff (booking flow)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can read active staff"
  ON staff FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated users have full access to staff"
  ON staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: clients
-- Public: NO direct access (use find_or_create_client RPC)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Authenticated users have full access to clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: appointments
-- Public: INSERT only (create booking), UPDATE voucher_path only
-- Authenticated: full CRUD
-- Note: Availability checks use get_available_slots RPC
--       (SECURITY DEFINER — bypasses anon RLS)
-- ============================================
CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update voucher path on recent appointments"
  ON appointments FOR UPDATE
  TO anon
  USING (
    voucher_path IS NULL
    AND created_at > now() - interval '10 minutes'
  )
  WITH CHECK (
    voucher_path IS NOT NULL
  );

CREATE POLICY "Authenticated users have full access to appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: appointment_services
-- Public: INSERT only (create booking services)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can create appointment_services"
  ON appointment_services FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to appointment_services"
  ON appointment_services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: blocked_times
-- Public: NO access (get_available_slots RPC handles internally)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Authenticated users have full access to blocked_times"
  ON blocked_times FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: appointment_history
-- Public: no access (admin-only audit trail)
-- Authenticated: full access
-- ============================================
CREATE POLICY "Authenticated users have full access to appointment_history"
  ON appointment_history FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: site_settings
-- Public: SELECT (landing page + payment page need settings)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users have full access to site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCTION: find_or_create_client (SECURITY DEFINER)
-- Called from booking flow to safely upsert clients
-- without exposing the clients table to anon users
-- ============================================
CREATE OR REPLACE FUNCTION find_or_create_client(
  p_phone TEXT,
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id INTEGER;
BEGIN
  -- Look up existing client by phone
  SELECT id INTO v_client_id
  FROM clients
  WHERE phone = p_phone
  LIMIT 1;

  IF v_client_id IS NOT NULL THEN
    -- Update existing client info
    UPDATE clients
    SET
      name = p_name,
      email = CASE WHEN p_email IS NOT NULL AND p_email <> '' THEN p_email ELSE email END,
      updated_at = now()
    WHERE id = v_client_id;
  ELSE
    -- Create new client
    INSERT INTO clients (name, email, phone, notes)
    VALUES (p_name, NULLIF(p_email, ''), p_phone, NULLIF(p_notes, ''))
    RETURNING id INTO v_client_id;
  END IF;

  RETURN v_client_id;
END;
$$;
