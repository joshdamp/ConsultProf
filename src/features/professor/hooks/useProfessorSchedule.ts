import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { ProfessorSchedule } from '@/app/types/database';
import { useAuth } from '@/app/Auth/AuthContext';
import { useToast } from '@/app/hooks/use-toast';

export function useProfessorSchedule() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['professor-schedule', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_schedules')
        .select('*')
        .eq('professor_id', profile?.id!)
        .order('weekday', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as ProfessorSchedule[];
    },
    enabled: !!profile?.id,
  });
}

export function useAddSchedule() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedule: Omit<ProfessorSchedule, 'id' | 'created_at' | 'professor_id'>) => {
      const { data, error } = await supabase
        .from('professor_schedules')
        .insert({
          ...schedule,
          professor_id: profile?.id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all professor-schedule queries
      queryClient.invalidateQueries({ queryKey: ['professor-schedule'] });
      // Also invalidate the specific query for this professor
      queryClient.invalidateQueries({ queryKey: ['professor-schedule', profile?.id] });
    },
    onError: (error: any) => {
      console.error('Failed to add schedule:', error);
      throw error;
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProfessorSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('professor_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['professor-schedule', profile?.id] });
      toast({
        title: 'Schedule updated',
        description: 'Your schedule has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update schedule',
      });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professor_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['professor-schedule', profile?.id] });
    },
    onError: (error: any) => {
      console.error('Failed to delete schedule:', error);
      throw error;
    },
  });
}
