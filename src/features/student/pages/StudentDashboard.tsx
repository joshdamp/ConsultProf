import React from 'react';
import Layout from '@/app/components/Layout';
import { useStudentBookings } from '../hooks/useStudentBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDate, formatTime } from '@/app/lib/date-utils';
import { useNavigate } from 'react-router-dom';
import { SkeletonList } from '@/app/components/ui/loading';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useStudentBookings();

  const pendingCount = bookings?.filter((b) => b.status === 'pending').length || 0;
  const confirmedCount = bookings?.filter((b) => b.status === 'confirmed').length || 0;
  const upcomingBookings = bookings
    ?.filter((b) => b.status === 'confirmed')
    .slice(0, 3) || [];

  const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/professors', label: 'Professors' },
    { to: '/student/bookings', label: 'My Bookings' },
  ];

  return (
    <Layout navLinks={navLinks}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your consultation overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting professor response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Upcoming consultations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your consultations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate('/student/professors')} className="flex-1">
              <User className="mr-2 h-4 w-4" />
              Browse Professors
            </Button>
            <Button
              onClick={() => navigate('/student/bookings')}
              variant="outline"
              className="flex-1"
            >
              <Calendar className="mr-2 h-4 w-4" />
              View My Bookings
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Consultations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>Your confirmed consultations</CardDescription>
              </div>
              {confirmedCount > 3 && (
                <Button variant="outline" onClick={() => navigate('/student/bookings')}>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonList count={2} />
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{booking.professor?.full_name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming consultations. Browse professors to book one!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
