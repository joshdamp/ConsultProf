-- ============================================
-- ConsultProf Database Schema
-- Copy this entire file and run it in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- 1. Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('student', 'professor')) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  student_number TEXT,
  teams_email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Professors
CREATE TABLE professors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  office_location TEXT,
  department TEXT,
  bio TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Professor Schedules
CREATE TABLE professor_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES professors(id) ON DELETE CASCADE,
  weekday INTEGER CHECK (weekday BETWEEN 1 AND 5) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT CHECK (type IN ('class', 'office_hour', 'consultation')) NOT NULL,
  note TEXT,
  visible_to_students BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Bookings/Consultation Requests
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  mode TEXT CHECK (mode IN ('online', 'onsite')) NOT NULL,
  topic TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES for better query performance
-- ============================================

CREATE INDEX idx_professor_schedules_professor_id ON professor_schedules(professor_id);
CREATE INDEX idx_professor_schedules_weekday ON professor_schedules(weekday);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_professor_id ON bookings(professor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Anyone can view professor profiles
CREATE POLICY "Anyone can view professor profiles"
  ON profiles FOR SELECT
  USING (role = 'professor');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PROFESSORS POLICIES
-- ============================================

-- Anyone authenticated can view all professors
CREATE POLICY "Anyone can view professors"
  ON professors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Professors can update their own record
CREATE POLICY "Professors can update own record"
  ON professors FOR UPDATE
  USING (auth.uid() = id);

-- Professors can insert their own record
CREATE POLICY "Professors can insert own record"
  ON professors FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PROFESSOR_SCHEDULES POLICIES
-- ============================================

-- Students can view schedules visible to them
CREATE POLICY "Students can view visible schedules"
  ON professor_schedules FOR SELECT
  USING (visible_to_students = true);

-- Professors can view their own schedules
CREATE POLICY "Professors can view own schedules"
  ON professor_schedules FOR SELECT
  USING (professor_id = auth.uid());

-- Professors can insert their own schedules
CREATE POLICY "Professors can insert own schedules"
  ON professor_schedules FOR INSERT
  WITH CHECK (professor_id = auth.uid());

-- Professors can update their own schedules
CREATE POLICY "Professors can update own schedules"
  ON professor_schedules FOR UPDATE
  USING (professor_id = auth.uid());

-- Professors can delete their own schedules
CREATE POLICY "Professors can delete own schedules"
  ON professor_schedules FOR DELETE
  USING (professor_id = auth.uid());

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Students can view their own bookings
CREATE POLICY "Students can view own bookings"
  ON bookings FOR SELECT
  USING (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Professors can view bookings for them
CREATE POLICY "Professors can view their bookings"
  ON bookings FOR SELECT
  USING (
    professor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'professor'
    )
  );

-- Students can create bookings
CREATE POLICY "Students can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Students can update their own bookings (cancel)
CREATE POLICY "Students can update own bookings"
  ON bookings FOR UPDATE
  USING (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Professors can update bookings for them (confirm/decline)
CREATE POLICY "Professors can update their bookings"
  ON bookings FOR UPDATE
  USING (
    professor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'professor'
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for professors table
CREATE TRIGGER update_professors_updated_at
  BEFORE UPDATE ON professors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (IMPORTANT!)
-- ============================================

-- Function to handle new user signup and create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, department, student_number, teams_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.email,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'student_number',
    NEW.raw_user_meta_data->>'teams_email'
  );
  
  -- If role is professor, also create professor record
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'professor' THEN
    INSERT INTO public.professors (id, office_location, department, bio)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'office_location',
      NEW.raw_user_meta_data->>'department',
      NEW.raw_user_meta_data->>'bio'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Note: You'll need to create users through Supabase Auth first
-- Then you can manually insert sample data referencing those user IDs

-- Example:
-- INSERT INTO profiles (id, role, full_name, email, department) VALUES
-- ('user-uuid-here', 'professor', 'Dr. John Smith', 'john@university.edu', 'Computer Science');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'professors', 'professor_schedules', 'bookings');

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'professors', 'professor_schedules', 'bookings');
