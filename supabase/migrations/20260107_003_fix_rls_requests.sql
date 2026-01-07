-- Fix RLS policies for requests, profiles, messages, and user_roles tables
-- Replace has_role() function calls with direct subqueries for reliability

-- ============================================
-- FIX user_roles policies (concierge needs to see player roles)
-- ============================================
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Concierge can view all roles" ON public.user_roles;

-- Users can see their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Concierge/Admin can see all roles (needed to list players)
CREATE POLICY "Concierge can view all roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('concierge', 'admin')
    )
  );

-- ============================================
-- FIX requests policies
-- ============================================

-- Drop existing policies on requests
DROP POLICY IF EXISTS "Players can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Concierge can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Concierge can update requests" ON public.requests;

-- Recreate with direct EXISTS subqueries (more reliable than function calls)
CREATE POLICY "Players can view own requests"
  ON public.requests FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Concierge can view all requests"
  ON public.requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('concierge', 'admin')
    )
  );

CREATE POLICY "Concierge can update requests"
  ON public.requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('concierge', 'admin')
    )
  );

-- Also fix profiles policies for concierge access
DROP POLICY IF EXISTS "Concierge can view all profiles" ON public.profiles;

CREATE POLICY "Concierge can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('concierge', 'admin')
    )
  );

-- Fix messages policies
DROP POLICY IF EXISTS "Concierge can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Concierge can create messages" ON public.messages;

CREATE POLICY "Concierge can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('concierge', 'admin')
    )
  );

CREATE POLICY "Concierge can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('concierge', 'admin')
    )
  );
