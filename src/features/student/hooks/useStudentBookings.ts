import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { Booking } from '@/app/types/database';
import { useAuth } from '@/app/Auth/AuthContext';
import { useToast } from '@/app/hooks/use-toast';

export function useStudentBookings() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['student-bookings', profile?.id],
    queryFn: async () => {
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
      const professorIds = [...new Set(bookings.map(b => b.professor_id))];
      const { data: professors, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', professorIds);

      if (profError) throw profError;

      // Merge the data
      return bookings.map(booking => ({
        ...booking,
        professor: professors?.find(p => p.id === booking.professor_id)
      })) as Booking[];
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
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          student_id: profile?.id!,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
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
