import React from 'react';
import Layout from '@/app/components/Layout';
import { GridScheduleEditor } from '../components/GridScheduleEditor';
import { useProfessorSchedule } from '../hooks/useProfessorSchedule';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { Calendar } from 'lucide-react';

export default function ProfessorSchedule() {
  const { data: schedules, isLoading, error } = useProfessorSchedule();

  const navLinks = [
    { to: '/professor/dashboard', label: 'Dashboard' },
    { to: '/professor/schedule', label: 'My Schedule' },
    { to: '/professor/requests', label: 'Requests' },
    { to: '/professor/bookings', label: 'Bookings' },
  ];

  return (
    <Layout navLinks={navLinks}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Click on any time slot to add your availability. Each slot is 1 hour 15 minutes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon={Calendar}
            title="Error loading schedule"
            description="There was a problem loading your schedule. Please try again."
          />
        ) : (
          <GridScheduleEditor schedules={schedules || []} />
        )}
      </div>
    </Layout>
  );
}
