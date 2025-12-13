import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { ProfessorSchedule } from '@/app/types/database';

export function useProfessorPublicSchedule(professorId: string) {
  return useQuery({
    queryKey: ['professor-public-schedule', professorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_schedules')
        .select('*')
        .eq('professor_id', professorId)
        .eq('visible_to_students', true)
        .order('weekday', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as ProfessorSchedule[];
    },
    enabled: !!professorId,
  });
}
