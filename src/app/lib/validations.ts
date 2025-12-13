import { z } from 'zod';

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'professor'], {
    required_error: 'Please select a role',
  }),
  department: z.string().optional(),
  program: z.string().optional(),
  student_number: z.string().optional(),
  teams_email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const bookingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  mode: z.enum(['online', 'onsite'], {
    required_error: 'Please select a mode',
  }),
  topic: z.string().min(5, 'Topic must be at least 5 characters'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const scheduleSchema = z.object({
  weekday: z.number().min(1).max(5),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  type: z.enum(['class', 'office_hour', 'consultation']),
  note: z.string().optional(),
  visible_to_students: z.boolean().default(true),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export const professorProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().optional(),
  office_location: z.string().optional(),
  bio: z.string().optional(),
});

export type ProfessorProfileFormData = z.infer<typeof professorProfileSchema>;
