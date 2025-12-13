import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { Professor, Profile } from '@/app/types/database';

type ProfessorWithProfile = Professor & { profile: Profile };

export function useProfessors(searchTerm?: string) {
  return useQuery<ProfessorWithProfile[]>({
    queryKey: ['professors', searchTerm],
    queryFn: async (): Promise<ProfessorWithProfile[]> => {
      // First get professors
      let query = supabase
        .from('professors')
        .select('*');

      if (searchTerm) {
        query = query.or(`
          department.ilike.%${searchTerm}%
        `);
      }

      const { data: professors, error: profError } = await query;
      if (profError) throw profError;

      // Then get their profiles
      const professorIds = (professors || []).map((p: any) => p.id);
      if (professorIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', professorIds);

      if (profileError) throw profileError;

      // Merge the data
      const result = (professors || []).map((prof: any) => {
        const profile = (profiles || []).find((p: any) => p.id === prof.id);
        return { ...prof, profile } as ProfessorWithProfile;
      });

      // Filter by search term if provided
      if (searchTerm) {
        return result.filter(p => 
          p.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by full name
      return result.sort((a, b) => 
        (a.profile?.full_name || '').localeCompare(b.profile?.full_name || '')
      );
    },
  });
}

export function useProfessor(id: string) {
  return useQuery<ProfessorWithProfile>({
    queryKey: ['professor', id],
    queryFn: async (): Promise<ProfessorWithProfile> => {
      // Get professor
      const { data: professor, error: profError } = await supabase
        .from('professors')
        .select('*')
        .eq('id', id)
        .single();

      if (profError) throw profError;
      if (!professor) throw new Error('Professor not found');

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      return { ...(professor as any), profile: profile as any } as ProfessorWithProfile;
    },
    enabled: !!id,
  });
}
