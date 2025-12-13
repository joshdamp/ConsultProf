import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/app/components/Layout';
import { useProfessor } from '../hooks/useProfessors';
import { BookingForm } from '../components/BookingForm';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function StudentBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: professor, isLoading } = useProfessor(id!);
  
  // Get the selected slot from navigation state
  const selectedSlot = location.state?.selectedSlot as { weekday: number; start_time: string; end_time: string } | undefined;

  const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/professors', label: 'Professors' },
    { to: '/student/bookings', label: 'My Bookings' },
  ];

  if (isLoading) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/student/professors/${id}`)}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Professor
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Consultation</h1>
          <p className="text-muted-foreground mt-1">
            Request a consultation with {professor.profile.full_name}
          </p>
        </div>

        <BookingForm 
          professorId={id!} 
          professorName={professor.profile.full_name}
          selectedSlot={selectedSlot}
        />
      </div>
    </Layout>
  );
}
