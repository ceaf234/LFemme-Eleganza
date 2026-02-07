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
-- Public: SELECT (for email upsert check), INSERT (new clients),
--         UPDATE (update existing client on rebooking)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can read clients for upsert"
  ON clients FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can create clients"
  ON clients FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update clients"
  ON clients FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: appointments
-- Public: SELECT (availability checks), INSERT (create booking)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can read appointments"
  ON appointments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: appointment_services
-- Public: SELECT (joins), INSERT (create booking services)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can read appointment_services"
  ON appointment_services FOR SELECT
  TO anon
  USING (true);

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
-- Public: SELECT (availability RPC needs this)
-- Authenticated: full CRUD
-- ============================================
CREATE POLICY "Public can read blocked_times"
  ON blocked_times FOR SELECT
  TO anon
  USING (true);

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
