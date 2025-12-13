import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase';
import { Professor, Profile } from '@/app/types/database';

export function useProfessors(searchTerm?: string) {
  return useQuery({
    queryKey: ['professors', searchTerm],
    queryFn: async () => {
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
      const professorIds = professors?.map(p => p.id) || [];
      if (professorIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', professorIds);

      if (profileError) throw profileError;

      // Merge the data
      const result = professors.map(prof => {
        const profile = profiles?.find(p => p.id === prof.id);
        return { ...prof, profile } as Professor & { profile: Profile };
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
  return useQuery({
    queryKey: ['professor', id],
    queryFn: async () => {
      // Get professor
      const { data: professor, error: profError } = await supabase
        .from('professors')
        .select('*')
        .eq('id', id)
        .single();

      if (profError) throw profError;

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      return { ...professor, profile } as Professor & { profile: Profile };
    },
    enabled: !!id,
  });
}
