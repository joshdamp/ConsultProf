import React from 'react';
import Layout from '@/app/components/Layout';
import { ProfessorList } from '../components/ProfessorList';

export default function StudentProfessors() {
  const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/professors', label: 'Professors' },
    { to: '/student/bookings', label: 'My Bookings' },
  ];

  return (
    <Layout navLinks={navLinks}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Professors</h1>
          <p className="text-muted-foreground mt-1">
            Find and book consultations with available professors
          </p>
        </div>

        <ProfessorList />
      </div>
    </Layout>
  );
}
