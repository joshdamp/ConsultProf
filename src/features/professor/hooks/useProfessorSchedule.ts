import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { ProfessorSchedule } from '@/app/types/database';
import { useAuth } from '@/app/Auth/AuthContext';

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

  return useMutation({
    mutationFn: async (schedule: Omit<ProfessorSchedule, 'id' | 'created_at' | 'professor_id'>) => {
      const insertData = {
        professor_id: profile?.id!,
        weekday: schedule.weekday,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        type: schedule.type,
        note: schedule.note,
        visible_to_students: schedule.visible_to_students,
      };
      
      // @ts-ignore - Supabase types are overly strict
      const { data, error} = await supabase
        .from('professor_schedules')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data as ProfessorSchedule;
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
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProfessorSchedule> & { id: string }) => {
      const { professor_id, created_at, ...validUpdates } = updates as Record<string, any>;
      
      // @ts-ignore - Supabase types are overly strict
      const { data, error } = await supabase
        .from('professor_schedules')
        .update(validUpdates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProfessorSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['professor-schedule', profile?.id] });
    },
    onError: (error: any) => {
      console.error('Failed to update schedule:', error);
      throw error;
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
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
