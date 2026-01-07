-- Fix RLS policies for categories and services
-- Run this AFTER the initial migration if categories/services are not showing

-- Drop restrictive policies
DROP POLICY IF EXISTS "Anyone authenticated can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone authenticated can view services" ON public.services;

-- Create simpler policies (no auth required for viewing active items)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Also ensure profiles policy allows insert for trigger
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow service account to insert profiles (for trigger)
CREATE POLICY "Service can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
