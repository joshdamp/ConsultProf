import React from 'react';
import Layout from '@/app/components/Layout';
import { RequestsList } from '../components/RequestsList';

export default function ProfessorRequests() {
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
          <h1 className="text-3xl font-bold tracking-tight">Consultation Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and respond to student consultation requests
          </p>
        </div>

        <RequestsList />
      </div>
    </Layout>
  );
}
