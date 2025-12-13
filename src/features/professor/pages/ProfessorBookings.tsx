import Layout from '@/app/components/Layout';
import { useProfessorBookings } from '../hooks/useProfessorRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { SkeletonList } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { Badge } from '@/app/components/ui/badge';
import { formatDate, formatTime } from '@/app/lib/date-utils';
import { Calendar, Clock, User, MapPin, Video } from 'lucide-react';

export default function ProfessorBookings() {
  const { data: bookings, isLoading } = useProfessorBookings();

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
          <h1 className="text-3xl font-bold tracking-tight">Confirmed Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Your upcoming confirmed consultations
          </p>
        </div>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {booking.student?.full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.mode === 'online' ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge variant="outline">
                      {booking.mode === 'online' ? 'Online' : 'On-site'}
                    </Badge>
                  </div>

                  {booking.topic && (
                    <div>
                      <p className="text-sm font-medium mb-1">Topic:</p>
                      <p className="text-sm text-muted-foreground">{booking.topic}</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground space-y-1.5 border-t pt-3 mt-3">
                    <div className="font-medium text-foreground mb-2">Student Information:</div>
                    <div>Name: {booking.student?.full_name || 'Unknown'}</div>
                    {booking.student?.student_number && (
                      <div>Student #: {booking.student.student_number}</div>
                    )}
                    <div>Email: {booking.student?.email}</div>
                    {booking.student?.department && (
                      <div>Department: {booking.student.department}</div>
                    )}
                    {booking.student?.program && (
                      <div>Program: {booking.student.program}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            title="No confirmed bookings"
            description="You don't have any confirmed consultations yet."
          />
        )}
      </div>
    </Layout>
  );
}
