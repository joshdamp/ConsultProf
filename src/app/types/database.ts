export type UserRole = 'student' | 'professor';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  department: string | null;
  program: string | null;
  student_number: string | null;
  teams_email: string | null;
  created_at: string;
}

export interface Professor {
  id: string;
  office_location: string | null;
  department: string | null;
  bio: string | null;
  updated_at: string;
  profile?: Profile;
}

export type ScheduleType = 'class' | 'office_hour' | 'consultation';

export interface ProfessorSchedule {
  id: string;
  professor_id: string;
  weekday: number; // 1=Mon, 5=Fri
  start_time: string;
  end_time: string;
  type: ScheduleType;
  note: string | null;
  visible_to_students: boolean;
  created_at: string;
}

export type BookingMode = 'online' | 'onsite';
export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled';

export interface Booking {
  id: string;
  student_id: string;
  professor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  mode: BookingMode;
  topic: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  student?: Profile;
  professor?: Profile;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      professors: {
        Row: Professor;
        Insert: Omit<Professor, 'updated_at'>;
        Update: Partial<Omit<Professor, 'id' | 'updated_at'>>;
      };
      professor_schedules: {
        Row: ProfessorSchedule;
        Insert: Omit<ProfessorSchedule, 'id' | 'created_at'>;
        Update: Partial<Omit<ProfessorSchedule, 'id' | 'created_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
