import React from 'react';
import { useProfessorSchedule, useDeleteSchedule } from '../hooks/useProfessorSchedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { SkeletonList } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { WEEKDAYS, formatTime } from '@/app/lib/date-utils';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ProfessorSchedule } from '@/app/types/database';

interface WeeklyScheduleViewProps {
  onAddClick: () => void;
}

const typeColors = {
  class: 'bg-blue-100 text-blue-800 border-blue-200',
  office_hour: 'bg-green-100 text-green-800 border-green-200',
  consultation: 'bg-orange-100 text-orange-800 border-orange-200',
};

const typeLabels = {
  class: 'Class',
  office_hour: 'Office Hour',
  consultation: 'Consultation',
};

export function WeeklyScheduleView({ onAddClick }: WeeklyScheduleViewProps) {
  const { data: schedules, isLoading } = useProfessorSchedule();
  const deleteSchedule = useDeleteSchedule();

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  if (!schedules || schedules.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        title="No schedule yet"
        description="Start by adding your first schedule block. Students will be able to see your availability."
        action={
          <Button onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        }
      />
    );
  }

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.weekday]) {
      acc[schedule.weekday] = [];
    }
    acc[schedule.weekday].push(schedule);
    return acc;
  }, {} as Record<number, ProfessorSchedule[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Weekly Schedule</h3>
        <Button onClick={onAddClick} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </div>

      {/* Desktop: Grid View */}
      <div className="hidden md:grid md:grid-cols-5 gap-4">
        {WEEKDAYS.map((day, index) => (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupedSchedules[index + 1]?.map((schedule) => (
                <ScheduleBlock
                  key={schedule.id}
                  schedule={schedule}
                  onDelete={() => deleteSchedule.mutate(schedule.id)}
                />
              ))}
              {!groupedSchedules[index + 1] && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No schedule
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile: List View */}
      <div className="md:hidden space-y-3">
        {WEEKDAYS.map((day, index) => {
          const daySchedules = groupedSchedules[index + 1];
          if (!daySchedules) return null;

          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySchedules.map((schedule) => (
                  <ScheduleBlock
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={() => deleteSchedule.mutate(schedule.id)}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleBlock({ 
  schedule, 
  onDelete 
}: { 
  schedule: ProfessorSchedule; 
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border text-xs space-y-1',
        typeColors[schedule.type]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{typeLabels[schedule.type]}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="font-mono">
        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
      </div>
      {schedule.note && (
        <div className="text-xs opacity-80">{schedule.note}</div>
      )}
    </div>
  );
}
