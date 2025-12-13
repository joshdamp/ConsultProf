import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, BookingFormData } from '@/app/lib/validations';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useCreateBooking } from '../hooks/useStudentBookings';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { TIME_SLOTS } from '@/app/lib/date-utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface BookingFormProps {
  professorId: string;
  professorName: string;
  selectedSlot?: {
    weekday: number;
    start_time: string;
    end_time: string;
  };
}

export function BookingForm({ professorId, professorName, selectedSlot }: BookingFormProps) {
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: selectedSlot ? {
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
    } : undefined,
  });

  const mode = watch('mode');

  const onSubmit = async (data: BookingFormData) => {
    await createBooking.mutateAsync({
      professor_id: professorId,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      mode: data.mode,
      topic: data.topic,
    });
    navigate('/student/bookings');
  };

  // Generate date options (next 14 weekdays)
  const dateOptions: string[] = [];
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // If a slot is pre-selected, only show dates for that weekday
    if (selectedSlot) {
      if (dayOfWeek === selectedSlot.weekday) {
        dateOptions.push(format(date, 'yyyy-MM-dd'));
      }
    } else {
      // Otherwise, only include Mon-Fri (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dateOptions.push(format(date, 'yyyy-MM-dd'));
      }
    }
    if (dateOptions.length >= 14) break;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Consultation</CardTitle>
        <CardDescription>
          Book a consultation with {professorName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {selectedSlot && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-primary">
                📅 Pre-selected Time Slot
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date {selectedSlot && <span className="text-xs text-muted-foreground">(Only showing {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedSlot.weekday]}s)</span>}</Label>
            <Select onValueChange={(value) => setValue('date', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(new Date(date), 'EEEE, MMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select 
                onValueChange={(value) => setValue('start_time', value)} 
                defaultValue={selectedSlot?.start_time}
                disabled={!!selectedSlot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.start_time && (
                <p className="text-sm text-destructive">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Select 
                onValueChange={(value) => setValue('end_time', value)}
                defaultValue={selectedSlot?.end_time}
                disabled={!!selectedSlot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.end_time && (
                <p className="text-sm text-destructive">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meeting Mode</Label>
            <Select
              value={mode}
              onValueChange={(value: any) => setValue('mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
            {errors.mode && (
              <p className="text-sm text-destructive">{errors.mode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Purpose</Label>
            <Textarea
              id="topic"
              placeholder="Briefly describe what you'd like to discuss..."
              {...register('topic')}
              rows={4}
            />
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
              disabled={createBooking.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createBooking.isPending}>
              {createBooking.isPending ? <LoadingSpinner size={20} /> : 'Send Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
