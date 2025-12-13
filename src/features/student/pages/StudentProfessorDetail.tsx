import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/app/components/Layout';
import { useProfessor } from '../hooks/useProfessors';
import { useProfessorPublicSchedule } from '../hooks/useProfessorSchedule';
import { GridScheduleViewer } from '../components/GridScheduleViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { MapPin, Mail, ArrowLeft } from 'lucide-react';

export default function StudentProfessorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: professor, isLoading: loadingProfessor } = useProfessor(id!);
  const { data: schedules, isLoading: loadingSchedules } = useProfessorPublicSchedule(id!);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

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

  const handleSlotSelect = (slotData: { weekday: number; start_time: string; end_time: string; slotKey: string }) => {
    setSelectedSlotKey(slotData.slotKey);
    // Navigate to booking page with the selected slot info
    navigate(`/student/professors/${id}/book`, { 
      state: { 
        selectedSlot: {
          weekday: slotData.weekday,
          start_time: slotData.start_time,
          end_time: slotData.end_time
        }
      } 
    });
  };

  if (loadingProfessor) {
    return (
      <Layout navLinks={navLinks}>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size={48} />
        </div>
      </Layout>
    );
  }

  if (!professor) {
    return (
      <Layout navLinks={navLinks}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Professor not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout navLinks={navLinks}>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/student/professors')}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Professors
        </Button>

        {/* Professor Info */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(professor.profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{professor.profile.full_name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {professor.department || professor.profile.department || 'Professor'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {professor.office_location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{professor.office_location}</span>
              </div>
            )}
            {professor.profile.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{professor.profile.email}</span>
              </div>
            )}
            {professor.bio && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">{professor.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
          {loadingSchedules ? (
            <div className="flex justify-center p-12">
              <LoadingSpinner />
            </div>
          ) : (
            <GridScheduleViewer 
              schedules={schedules || []} 
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlotKey || undefined}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
