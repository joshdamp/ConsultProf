import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { Booking, BookingStatus } from '@/app/types/database';
import { useAuth } from '@/app/Auth/AuthContext';
import { useToast } from '@/app/hooks/use-toast';

export function useProfessorRequests() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['professor-requests', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student:profiles!bookings_student_id_fkey(*)
        `)
        .eq('professor_id', profile?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!profile?.id,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['professor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['professor-bookings'] });
      
      const statusText = variables.status === 'confirmed' ? 'confirmed' : 'declined';
      toast({
        title: `Consultation ${statusText}`,
        description: `You have ${statusText} the consultation request.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update booking status',
      });
    },
  });
}

export function useProfessorBookings() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['professor-bookings', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student:profiles!bookings_student_id_fkey(*)
        `)
        .eq('professor_id', profile?.id!)
        .eq('status', 'confirmed')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!profile?.id,
  });
}
