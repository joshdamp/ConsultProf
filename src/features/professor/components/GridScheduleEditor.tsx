import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { TIME_SLOT_PAIRS, WEEKDAYS } from '@/app/lib/date-utils';
import { useAddSchedule, useDeleteSchedule } from '../hooks/useProfessorSchedule';
import { ProfessorSchedule } from '@/app/types/database';
import { X } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';

interface GridScheduleEditorProps {
  schedules: ProfessorSchedule[];
}

export function GridScheduleEditor({ schedules }: GridScheduleEditorProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ weekday: number; slot: number } | null>(null);
  const [note, setNote] = useState('');
  const [scheduleType, setScheduleType] = useState<'class' | 'consultation'>('class');
  
  const addSchedule = useAddSchedule();
  const deleteSchedule = useDeleteSchedule();
  const { toast } = useToast();

  // Create a map of schedules by weekday and time
  const scheduleMap = new Map<string, ProfessorSchedule>();
  schedules.forEach(schedule => {
    // Normalize time to HH:mm format (remove seconds if present)
    const startTime = schedule.start_time.substring(0, 5);
    const key = `${schedule.weekday}-${startTime}`;
    scheduleMap.set(key, schedule);
  });

  const handleCellClick = (weekdayIndex: number, slotIndex: number) => {
    setSelectedSlot({ weekday: weekdayIndex + 1, slot: slotIndex });
  };

  const handleAddSchedule = async () => {
    if (!selectedSlot) return;

    const slot = TIME_SLOT_PAIRS[selectedSlot.slot];
    
    try {
      await addSchedule.mutateAsync({
        weekday: selectedSlot.weekday,
        start_time: slot.start,
        end_time: slot.end,
        type: scheduleType,
        note: note || null,
        visible_to_students: true,
      });

      toast({
        title: `${scheduleType === 'class' ? 'Class' : 'Consultation'} schedule added`,
        description: `Your ${scheduleType} schedule has been added successfully.`,
      });

      setSelectedSlot(null);
      setNote('');
      setScheduleType('class');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add schedule.',
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule.mutateAsync(scheduleId);
      toast({
        title: 'Schedule removed',
        description: 'The schedule block has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove schedule.',
      });
    }
  };

  const getScheduleColor = (type: 'class' | 'consultation') => {
    if (type === 'class') {
      return 'bg-red-100 text-red-800 border-red-300';
    } else {
      return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
          <span>Class (Busy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Consultation (Bookable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded" />
          <span>Empty Slot</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Click on empty slots to add either a <strong>Class</strong> (not bookable) or <strong>Consultation</strong> (students can book). Empty slots remain blank.
        </p>
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
                      const isSelected = 
                        selectedSlot?.weekday === weekdayIndex + 1 && 
                        selectedSlot?.slot === slotIndex;

                      return (
                        <td
                          key={weekdayIndex}
                          className={`border p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? 'ring-2 ring-primary ring-inset' : ''
                          }`}
                          onClick={() => !schedule && handleCellClick(weekdayIndex, slotIndex)}
                        >
                          {schedule ? (
                            <div className={`relative p-2 rounded text-xs ${getScheduleColor(schedule.type)} border`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchedule(schedule.id);
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="font-medium uppercase">{schedule.type}</div>
                              {schedule.note && (
                                <div className="text-xs mt-1 truncate">{schedule.note}</div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-xs text-gray-400 bg-white rounded">
                              {isSelected ? '✓ Selected' : '—'}
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

      {/* Add Schedule Form */}
      {selectedSlot && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Add Schedule for {WEEKDAYS[selectedSlot.weekday - 1]} at {TIME_SLOT_PAIRS[selectedSlot.slot].label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <Select value={scheduleType} onValueChange={(value: 'class' | 'consultation') => setScheduleType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class (Not Bookable)</SelectItem>
                  <SelectItem value="consultation">Consultation (Students Can Book)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course Code / Room Number / Note (Optional)</Label>
              <Input
                placeholder="e.g., CS200-2R / E314"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddSchedule} disabled={addSchedule.isPending} className="flex-1">
                {addSchedule.isPending ? 'Adding...' : `Add ${scheduleType === 'class' ? 'Class' : 'Consultation'}`}
              </Button>
              <Button variant="outline" onClick={() => { setSelectedSlot(null); setScheduleType('class'); setNote(''); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
