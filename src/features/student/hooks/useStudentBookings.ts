import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { Booking, Profile, BookingStatus } from '@/app/types/database';
import { useAuth } from '@/app/Auth/AuthContext';
import { useToast } from '@/app/hooks/use-toast';

type BookingWithProfessor = Booking & { professor?: Profile };

export function useStudentBookings() {
  const { profile } = useAuth();

  return useQuery<BookingWithProfessor[]>({
    queryKey: ['student-bookings', profile?.id],
    queryFn: async (): Promise<BookingWithProfessor[]> => {
      // Get bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('student_id', profile?.id!)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false });

      if (bookingsError) throw bookingsError;
      if (!bookings || bookings.length === 0) return [];

      // Get professor profiles
      const professorIds = [...new Set((bookings || []).map((b: any) => b.professor_id))];
      const { data: professors, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', professorIds);

      if (profError) throw profError;

      // Merge the data
      return (bookings || []).map((booking: any) => ({
        ...booking,
        professor: (professors || []).find((p: any) => p.id === booking.professor_id)
      })) as BookingWithProfessor[];
    },
    enabled: !!profile?.id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'student_id' | 'status'>
    ) => {
      const insertData = {
        professor_id: booking.professor_id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        mode: booking.mode,
        topic: booking.topic,
        student_id: profile?.id!,
        status: 'pending' as BookingStatus,
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
      toast({
        title: 'Request sent!',
        description: 'Your consultation request has been sent to the professor.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create booking',
      });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const updateData: { status: 'cancelled'; updated_at: string } = { 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      };
      // @ts-ignore - Supabase types are overly strict
      const { error } = await supabase
        .from('bookings')
        .update(updateData as any)
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] });
      toast({
        title: 'Booking cancelled',
        description: 'Your consultation has been cancelled.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to cancel booking',
      });
    },
  });
}
