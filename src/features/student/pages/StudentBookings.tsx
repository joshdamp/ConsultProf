import Layout from '@/app/components/Layout';
import { useStudentBookings, useCancelBooking } from '../hooks/useStudentBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { SkeletonList } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { Badge } from '@/app/components/ui/badge';
import { formatDate, formatTime } from '@/app/lib/date-utils';
import { Calendar, Clock, User, MapPin, Video, X, MessageSquare, FileText } from 'lucide-react';
import { Booking } from '@/app/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { useState } from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function StudentBookings() {
  const { data: bookings, isLoading } = useStudentBookings();
  const cancelBooking = useCancelBooking();

  const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/professors', label: 'Professors' },
    { to: '/student/bookings', label: 'My Bookings' },
  ];

  const pendingBookings = bookings?.filter((b) => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter((b) => b.status === 'confirmed') || [];
  const pastBookings = bookings?.filter((b) => b.status === 'declined' || b.status === 'cancelled') || [];

  return (
    <Layout navLinks={navLinks}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your consultation requests and appointments
          </p>
        </div>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : bookings && bookings.length > 0 ? (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({confirmedBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={() => cancelBooking.mutate(booking.id)}
                    isCancelling={cancelBooking.isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Clock className="h-12 w-12 text-muted-foreground" />}
                  title="No pending requests"
                  description="You don't have any pending consultation requests."
                />
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-3">
              {confirmedBookings.length > 0 ? (
                confirmedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={() => cancelBooking.mutate(booking.id)}
                    isCancelling={cancelBooking.isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
                  title="No confirmed bookings"
                  description="You don't have any confirmed consultations yet."
                />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <EmptyState
                  icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
                  title="No past bookings"
                  description="Your declined or cancelled bookings will appear here."
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            title="No bookings yet"
            description="Start by browsing professors and requesting a consultation."
          />
        )}
      </div>
    </Layout>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
  isCancelling?: boolean;
}

function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {booking.professor?.full_name}
              </CardTitle>
            </div>
            <Badge className={statusColors[booking.status]}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">Topic:</p>
              <p className="text-sm text-muted-foreground">{booking.topic}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {booking.professor_notes && (
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                onClick={onCancel}
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={isCancelling}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>
              Notes from {booking.professor?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                {formatDate(booking.date)} at {formatTime(booking.start_time)}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[booking.status]}>
                  {booking.status}
                </Badge>
                <Badge variant="outline">
                  {booking.mode === 'online' ? 'Online' : 'On-site'}
                </Badge>
              </div>
            </div>

            {booking.topic && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Your Topic:</p>
                <p className="text-sm text-muted-foreground">{booking.topic}</p>
              </div>
            )}

            {booking.professor_notes && (
              <div className="space-y-1 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Professor's Notes:
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.professor_notes}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
