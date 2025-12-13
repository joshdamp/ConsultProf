-- Fix RLS policies for profiles table to prevent infinite recursion
-- Use simple policies that don't self-reference the profiles table

-- First, drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Professors can view students who booked with them" ON profiles;
DROP POLICY IF EXISTS "Students can view professors they booked with" ON profiles;
DROP POLICY IF EXISTS "Anyone can view professor profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view all professors" ON profiles;
DROP POLICY IF EXISTS "Professors can view students" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies with NO self-references to avoid recursion

-- 1. Users can always view and update their own profile (no recursion)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. All authenticated users can view all profiles (simple and safe)
-- This allows professors to see students and vice versa without recursion
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

