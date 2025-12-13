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

  const getScheduleColor = () => {
    // Classes are occupied (not bookable)
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const isSelectable = (schedule: ProfessorSchedule | undefined) => {
    // Can book if slot is empty (no class)
    return !schedule;
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
          <span>Class (Not Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
          <span>Available for Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">👆</span>
          <span>Click green slots to book</span>
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
                                ${getScheduleColor()}
                                cursor-not-allowed
                              `}
                            >
                              <div className="font-medium">CLASS</div>
                              {schedule.note && (
                                <div className="text-xs mt-1 truncate">{schedule.note}</div>
                              )}
                              <div className="text-xs mt-1 opacity-70">Not available</div>
                            </div>
                          ) : (
                            <div 
                              className={`
                                p-2 rounded text-xs border h-16 flex flex-col items-center justify-center transition-all
                                ${isSelected 
                                  ? 'bg-green-200 border-green-400 ring-2 ring-green-500 shadow-md scale-105' 
                                  : 'bg-green-50 border-green-200 hover:bg-green-100'
                                }
                                cursor-pointer
                              `}
                            >
                              <div className="font-medium text-green-700">AVAILABLE</div>
                              <div className="text-xs text-green-600 mt-1">Click to book</div>
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
        * Click on any available slot (green) to request a consultation with this professor.
      </p>
    </div>
  );
}
