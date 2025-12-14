import { useProfessorRequests, useUpdateBookingStatus } from '../hooks/useProfessorRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { SkeletonList } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { formatDate, formatTime } from '@/app/lib/date-utils';
import { Check, X, Calendar, Clock, User, MessageSquare, Mail, Hash, Building2, GraduationCap } from 'lucide-react';
import { Booking } from '@/app/types/database';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { useState } from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const modeLabels = {
  online: 'Online',
  onsite: 'On-site',
};

export function RequestsList() {
  const { data: requests, isLoading } = useProfessorRequests();
  const updateStatus = useUpdateBookingStatus();

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  const pendingRequests = requests?.filter((r) => r.status === 'pending') || [];
  const otherRequests = requests?.filter((r) => r.status !== 'pending') || [];

  if (requests?.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        title="No consultation requests"
        description="You'll see student consultation requests here once they start booking."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={() =>
                  updateStatus.mutate({ id: request.id, status: 'confirmed' })
                }
                onDecline={() =>
                  updateStatus.mutate({ id: request.id, status: 'declined' })
                }
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Requests */}
      {otherRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Past Requests</h3>
          <div className="space-y-3">
            {otherRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface RequestCardProps {
  request: Booking;
  onAccept?: () => void;
  onDecline?: () => void;
  isUpdating?: boolean;
}

function RequestCard({ request, onAccept, onDecline, isUpdating }: RequestCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'accept' | 'decline'>('accept');
  const [notes, setNotes] = useState('');
  const updateStatus = useUpdateBookingStatus();

  const handleOpenDialog = (action: 'accept' | 'decline') => {
    setDialogAction(action);
    setNotes('');
    setShowDialog(true);
  };

  const handleConfirm = () => {
    const status = dialogAction === 'accept' ? 'confirmed' : 'declined';
    updateStatus.mutate(
      { id: request.id, status, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          setShowDialog(false);
          setNotes('');
        },
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {request.student?.full_name || 'Unknown Student'}
              </CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                {request.student?.student_number && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />
                    <span>{request.student.student_number}</span>
                  </div>
                )}
                {request.student?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{request.student.email}</span>
                  </div>
                )}
                {request.student?.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{request.student.department}</span>
                  </div>
                )}
                {request.student?.program && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{request.student.program}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={statusColors[request.status]}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(request.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(request.start_time)} - {formatTime(request.end_time)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{modeLabels[request.mode]}</Badge>
          </div>

          {request.topic && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Topic
              </div>
              <p className="text-sm text-muted-foreground pl-6">{request.topic}</p>
            </div>
          )}

          {request.professor_notes && (
            <div className="space-y-1 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Your Notes
              </div>
              <p className="text-sm text-muted-foreground pl-6">{request.professor_notes}</p>
            </div>
          )}

          {request.status === 'pending' && onAccept && onDecline && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={() => handleOpenDialog('accept')}
                className="flex-1"
                disabled={isUpdating || updateStatus.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button
                onClick={() => handleOpenDialog('decline')}
                variant="outline"
                className="flex-1"
                disabled={isUpdating || updateStatus.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'accept' ? 'Accept' : 'Decline'} Consultation
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'accept'
                ? 'Add any additional notes or instructions for the student (optional).'
                : 'Please provide a reason for declining this consultation request.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="notes">
              {dialogAction === 'accept' ? 'Notes (Optional)' : 'Reason for Decline'}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                dialogAction === 'accept'
                  ? 'E.g., Please prepare your questions beforehand...'
                  : 'E.g., Schedule conflict, unavailable...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={updateStatus.isPending}
              variant={dialogAction === 'decline' ? 'destructive' : 'default'}
            >
              {updateStatus.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
