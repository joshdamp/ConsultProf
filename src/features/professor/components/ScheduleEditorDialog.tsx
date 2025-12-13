import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { scheduleSchema, ScheduleFormData } from '@/app/lib/validations';
import { TIME_SLOTS, WEEKDAYS } from '@/app/lib/date-utils';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { useAddSchedule } from '../hooks/useProfessorSchedule';
import { LoadingSpinner } from '@/app/components/ui/loading';

interface ScheduleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleEditorDialog({ open, onOpenChange }: ScheduleEditorDialogProps) {
  const addSchedule = useAddSchedule();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      visible_to_students: true,
    },
  });

  const weekday = watch('weekday');
  const type = watch('type');

  const onSubmit = async (data: ScheduleFormData) => {
    const scheduleData = {
      weekday: data.weekday,
      start_time: data.start_time,
      end_time: data.end_time,
      type: data.type,
      note: data.note ? data.note : null,
      visible_to_students: data.visible_to_students,
    };
    await addSchedule.mutateAsync(scheduleData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Schedule Block</DialogTitle>
          <DialogDescription>
            Add a new time block to your weekly schedule
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Day of Week</Label>
            <Select
              value={weekday?.toString()}
              onValueChange={(value) => setValue('weekday', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((day, index) => (
                  <SelectItem key={day} value={(index + 1).toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.weekday && (
              <p className="text-sm text-destructive">{errors.weekday.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select onValueChange={(value) => setValue('start_time', value)}>
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
              <Select onValueChange={(value) => setValue('end_time', value)}>
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
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(value: any) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="office_hour">Office Hour</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g., Room 301"
              {...register('note')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addSchedule.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addSchedule.isPending}>
              {addSchedule.isPending ? <LoadingSpinner size={20} /> : 'Add Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
