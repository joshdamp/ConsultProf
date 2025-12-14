-- Add professor_notes column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS professor_notes TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN bookings.professor_notes IS 'Notes from professor when accepting or declining a consultation request';
