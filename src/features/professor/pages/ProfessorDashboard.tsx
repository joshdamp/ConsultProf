import Layout from '@/app/components/Layout';
import { useProfessorRequests, useProfessorBookings } from '../hooks/useProfessorRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDate, formatTime } from '@/app/lib/date-utils';
import { useNavigate } from 'react-router-dom';
import { SkeletonList } from '@/app/components/ui/loading';

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const { data: requests } = useProfessorRequests();
  const { data: bookings, isLoading: bookingsLoading } = useProfessorBookings();

  const pendingCount = requests?.filter((r) => r.status === 'pending').length || 0;
  const upcomingBookings = bookings?.slice(0, 3) || [];

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting your response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Upcoming consultations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Section */}
        {pendingCount > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>Review and respond to consultation requests</CardDescription>
                </div>
                <Button onClick={() => navigate('/professor/requests')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                You have {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} to review
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Consultations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>Your confirmed consultations</CardDescription>
              </div>
              {bookings && bookings.length > 3 && (
                <Button variant="outline" onClick={() => navigate('/professor/bookings')}>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <SkeletonList count={2} />
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{booking.student?.full_name}</p>
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
                No upcoming consultations
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
