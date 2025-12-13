import React from 'react';
import { useProfessorPublicSchedule } from '../hooks/useProfessorSchedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { SkeletonList } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { WEEKDAYS, formatTime } from '@/app/lib/date-utils';
import { Calendar } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ProfessorSchedule } from '@/app/types/database';

interface ScheduleViewerProps {
  professorId: string;
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

export function ScheduleViewer({ professorId }: ScheduleViewerProps) {
  const { data: schedules, isLoading } = useProfessorPublicSchedule(professorId);

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  if (!schedules || schedules.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        title="No schedule available"
        description="This professor hasn't published their schedule yet."
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
      {/* Desktop: Grid View */}
      <div className="hidden md:grid md:grid-cols-5 gap-4">
        {WEEKDAYS.map((day, index) => (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupedSchedules[index + 1]?.map((schedule) => (
                <ScheduleBlock key={schedule.id} schedule={schedule} />
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
                  <ScheduleBlock key={schedule.id} schedule={schedule} />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
          <span>Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
          <span>Office Hour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200" />
          <span>Consultation</span>
        </div>
      </div>
    </div>
  );
}

function ScheduleBlock({ schedule }: { schedule: ProfessorSchedule }) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border text-xs space-y-1',
        typeColors[schedule.type]
      )}
    >
      <div className="font-medium">{typeLabels[schedule.type]}</div>
      <div className="font-mono">
        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
      </div>
      {schedule.note && (
        <div className="text-xs opacity-80">{schedule.note}</div>
      )}
    </div>
  );
}
