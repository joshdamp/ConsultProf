-- Add program field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS program TEXT;

-- Update the handle_new_user trigger function to include program field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, department, program, student_number, teams_email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'program',
    NEW.raw_user_meta_data->>'student_number',
    NEW.raw_user_meta_data->>'teams_email'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on column
COMMENT ON COLUMN profiles.program IS 'Student program (e.g., BS Computer Science)';
