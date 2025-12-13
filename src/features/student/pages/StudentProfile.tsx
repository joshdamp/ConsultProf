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
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { useToast } from '@/app/hooks/use-toast';
import { supabase } from '@/app/lib/supabase';
import { User, Mail, Building2, Hash, Pencil } from 'lucide-react';

const studentProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  student_number: z.string().min(1, 'Student number is required'),
  department: z.string().optional(),
  program: z.string().optional(),
});

type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

export default function StudentProfile() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      student_number: profile?.student_number || '',
      department: profile?.department || '',
      program: profile?.program || '',
    },
    values: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      student_number: profile?.student_number || '',
      department: profile?.department || '',
      program: profile?.program || '',
    },
  });

  const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/professors', label: 'Professors' },
    { to: '/student/bookings', label: 'My Bookings' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onSubmit = async (data: StudentProfileFormData) => {
    setIsLoading(true);
    try {
      const profileUpdate = {
        full_name: data.full_name,
        student_number: data.student_number,
        department: data.department || null,
        program: data.program || null,
      };
      
      // @ts-ignore - Supabase types are overly strict
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate as any)
        .eq('id', profile?.id!);

      if (error) throw error;

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
          <p className="text-muted-foreground mt-2">
            Manage your personal information
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(profile.full_name || 'ST')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile.full_name}</CardTitle>
                  <div className="space-y-1 text-sm text-muted-foreground">
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
              <div className="grid gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </div>
                  </Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    disabled={!isEditing}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {/* Student Number */}
                <div className="space-y-2">
                  <Label htmlFor="student_number">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Student Number
                    </div>
                  </Label>
                  <Input
                    id="student_number"
                    {...register('student_number')}
                    disabled={!isEditing}
                  />
                  {errors.student_number && (
                    <p className="text-sm text-destructive">
                      {errors.student_number.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Department
                    </div>
                  </Label>
                  <Input
                    id="department"
                    {...register('department')}
                    disabled={!isEditing}
                    placeholder="Optional"
                  />
                  {errors.department && (
                    <p className="text-sm text-destructive">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* Program */}
                <div className="space-y-2">
                  <Label htmlFor="program">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Program
                    </div>
                  </Label>
                  <Input
                    id="program"
                    {...register('program')}
                    disabled={!isEditing}
                    placeholder="e.g., BS Computer Science"
                  />
                  {errors.program && (
                    <p className="text-sm text-destructive">
                      {errors.program.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
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
