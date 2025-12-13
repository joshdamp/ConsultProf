import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/app/components/Layout';
import { useAuth } from '@/app/Auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { useToast } from '@/app/hooks/use-toast';
import { supabase } from '@/app/lib/supabase';
import { Professor } from '@/app/types/database';
import { User, Mail, Building2, FileText, AtSign, Pencil } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const professorProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().optional(),
  teams_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  bio: z.string().optional(),
});

type ProfessorProfileFormData = z.infer<typeof professorProfileSchema>;

export default function ProfessorProfile() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch professor-specific data
  const { data: professorData } = useQuery({
    queryKey: ['professor-profile', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .eq('id', profile?.id!)
        .single();

      if (error) throw error;
      return data as Professor;
    },
    enabled: !!profile?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfessorProfileFormData>({
    resolver: zodResolver(professorProfileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      department: profile?.department || '',
      teams_email: profile?.teams_email || '',
      bio: professorData?.bio || '',
    },
    values: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      department: profile?.department || '',
      teams_email: profile?.teams_email || '',
      bio: professorData?.bio || '',
    },
  });

  const navLinks = [
    { to: '/professor/dashboard', label: 'Dashboard' },
    { to: '/professor/schedule', label: 'My Schedule' },
    { to: '/professor/requests', label: 'Requests' },
    { to: '/professor/bookings', label: 'Bookings' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onSubmit = async (data: ProfessorProfileFormData) => {
    setIsLoading(true);
    try {
      // Update profile table
      const profileUpdate = {
        full_name: data.full_name,
        email: data.email,
        department: data.department || null,
        teams_email: data.teams_email || null,
      };
      
      // @ts-ignore - Supabase types are overly strict
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate as any)
        .eq('id', profile?.id!);

      if (profileError) throw profileError;

      // Update professors table
      const professorUpdate = {
        department: data.department || null,
        bio: data.bio || null,
      };
      
      // @ts-ignore - Supabase types are overly strict
      const { error: professorError } = await supabase
        .from('professors')
        .update(professorUpdate as any)
        .eq('id', profile?.id!);

      if (professorError) throw professorError;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <Layout navLinks={navLinks}>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout navLinks={navLinks}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional information
          </p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                  <div className="space-y-1 mt-1 text-sm text-muted-foreground">
                    <div>{profile.email}</div>
                    <div className="text-xs capitalize">{profile.role}</div>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="icon" className="flex-shrink-0">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    disabled={!isEditing || isLoading}
                    className="transition-all"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing || isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teams_email" className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Teams Email
                  </Label>
                  <Input
                    id="teams_email"
                    type="email"
                    placeholder="professor@teams.university.edu"
                    {...register('teams_email')}
                    disabled={!isEditing || isLoading}
                  />
                  {errors.teams_email && (
                    <p className="text-sm text-destructive">{errors.teams_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    {...register('department')}
                    disabled={!isEditing || isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about yourself, your research interests, office hours, etc."
                    rows={4}
                    {...register('bio')}
                    disabled={!isEditing || isLoading}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be visible to students on your profile
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? <LoadingSpinner size={20} /> : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
