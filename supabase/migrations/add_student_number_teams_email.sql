-- Migration: Add student_number and teams_email columns to profiles table
-- Run this in Supabase SQL Editor if you already have an existing database

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_number TEXT,
ADD COLUMN IF NOT EXISTS teams_email TEXT;

-- Update the trigger function to handle new fields
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
