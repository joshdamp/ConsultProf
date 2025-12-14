import { Card, CardContent } from '@/app/components/ui/card';
import { TIME_SLOT_PAIRS, WEEKDAYS } from '@/app/lib/date-utils';
import { ProfessorSchedule } from '@/app/types/database';

interface SlotData {
  weekday: number;
  start_time: string;
  end_time: string;
  slotKey: string;
}

interface GridScheduleViewerProps {
  schedules: ProfessorSchedule[];
  onSlotSelect?: (slotData: SlotData) => void;
  selectedSlot?: string;
}

export function GridScheduleViewer({ schedules, onSlotSelect, selectedSlot }: GridScheduleViewerProps) {
  // Create a map of schedules by weekday and time
  const scheduleMap = new Map<string, ProfessorSchedule>();
  schedules.forEach(schedule => {
    // Normalize time to HH:mm format (remove seconds if present)
    const startTime = schedule.start_time.substring(0, 5);
    const key = `${schedule.weekday}-${startTime}`;
    scheduleMap.set(key, schedule);
  });

  const getScheduleColor = (schedule: ProfessorSchedule) => {
    if (schedule.type === 'class') {
      return 'bg-red-100 text-red-700 border-red-200';
    } else if (schedule.type === 'consultation') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    // office_hour or other types - treat as unavailable
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const isSelectable = (schedule: ProfessorSchedule | undefined) => {
    // Only consultation slots are bookable
    return schedule?.type === 'consultation';
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
          <span>Consultation (Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
          <span>Class (Busy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded" />
          <span>Not Available</span>
        </div>
      </div>

      {/* Grid Schedule */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-sm font-medium text-left min-w-[120px]">Time</th>
                  {WEEKDAYS.map((day, index) => (
                    <th key={index} className="border p-2 text-sm font-medium text-center min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOT_PAIRS.map((slot, slotIndex) => (
                  <tr key={slotIndex}>
                    <td className="border p-2 text-sm font-medium bg-gray-50">
                      {slot.label}
                    </td>
                    {WEEKDAYS.map((_, weekdayIndex) => {
                      const key = `${weekdayIndex + 1}-${slot.start}`;
                      const schedule = scheduleMap.get(key);
                      const canSelect = isSelectable(schedule);
                      const slotKey = `${weekdayIndex + 1}-${slotIndex}`;
                      const isSelected = selectedSlot === slotKey;

                      return (
                        <td
                          key={weekdayIndex}
                          className="border p-1"
                          onClick={() => canSelect && onSlotSelect && onSlotSelect({
                            weekday: weekdayIndex + 1,
                            start_time: slot.start,
                            end_time: slot.end,
                            slotKey
                          })}
                        >
                          {schedule ? (
                            <div 
                              className={`
                                p-2 rounded text-xs border transition-all
                                ${getScheduleColor(schedule)}
                                ${canSelect ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-not-allowed opacity-75'}
                              `}
                            >
                              <div className="font-medium capitalize">{schedule.type}</div>
                              {schedule.note && (
                                <div className="text-xs mt-1 truncate">{schedule.note}</div>
                              )}
                              {canSelect ? (
                                <div className="text-xs mt-1">Click to book</div>
                              ) : (
                                <div className="text-xs mt-1 opacity-70">Not available</div>
                              )}
                            </div>
                          ) : (
                            <div 
                              className="p-2 rounded text-xs border h-16 flex items-center justify-center bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                            >
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground">
        * Click on <strong className="text-green-600">Consultation</strong> slots (green) to request a booking with this professor.
      </p>
    </div>
  );
}
