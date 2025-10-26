'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus, X, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface TimeSelection {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
}

interface DateAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

interface RecurringPattern {
  daysOfWeek: DayOfWeek[];
  timeSlots: TimeSlot[];
}

interface MeetupSchedulerProps {
  onScheduleSelect: (availability: { specific: DateAvailability[]; recurring: RecurringPattern | null }) => void;
  initialAvailability?: { specific: DateAvailability[]; recurring: RecurringPattern | null };
}

// Reusable TimeSlot Picker Component
interface TimeSlotPickerProps {
  slots: TimeSlot[];
  onUpdate: (index: number, field: 'startTime' | 'endTime', value: string) => void;
  onRemove: (index: number) => void;
}

function TimeSlotPicker({ slots, onUpdate, onRemove }: TimeSlotPickerProps) {
  const timeStringToSelection = (timeStr: string): TimeSelection => {
    const [hours, minutes] = timeStr.split(':');
    const hour24 = parseInt(hours);
    const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return {
      hour: hour12.toString(),
      minute: minutes,
      period
    };
  };

  const timeSelectionToString = (selection: TimeSelection): string => {
    let hour24 = parseInt(selection.hour);
    if (selection.period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selection.period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${selection.minute}`;
  };

  return (
    <div className="space-y-3">
      {slots.map((slot, index) => {
        const startSelection = timeStringToSelection(slot.startTime);
        const endSelection = timeStringToSelection(slot.endTime);

        return (
          <div key={index} className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-primary-200">
            {/* Start Time */}
            <span className="text-xs text-accent-700">From:</span>
            <select
              value={startSelection.hour}
              onChange={(e) => {
                const newSelection = { ...startSelection, hour: e.target.value };
                onUpdate(index, 'startTime', timeSelectionToString(newSelection));
              }}
              className="px-2 py-1.5 text-sm bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500"
            >
              {[...Array(12)].map((_, i) => {
                const hour = i + 1;
                return <option key={hour} value={hour}>{hour}</option>;
              })}
            </select>
            <span className="text-sm text-primary-700">:</span>
            <select
              value={startSelection.minute}
              onChange={(e) => {
                const newSelection = { ...startSelection, minute: e.target.value };
                onUpdate(index, 'startTime', timeSelectionToString(newSelection));
              }}
              className="px-2 py-1.5 text-sm bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500"
            >
              {['00', '15', '30', '45'].map(min => (
                <option key={min} value={min}>{min}</option>
              ))}
            </select>
            <select
              value={startSelection.period}
              onChange={(e) => {
                const newSelection = { ...startSelection, period: e.target.value as 'AM' | 'PM' };
                onUpdate(index, 'startTime', timeSelectionToString(newSelection));
              }}
              className="px-2 py-1.5 text-sm bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>

            {/* End Time */}
            <span className="text-xs text-accent-700 ml-1">To:</span>
            <select
              value={endSelection.hour}
              onChange={(e) => {
                const newSelection = { ...endSelection, hour: e.target.value };
                onUpdate(index, 'endTime', timeSelectionToString(newSelection));
              }}
              className="px-2 py-1.5 text-sm bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500"
            >
              {[...Array(12)].map((_, i) => {
                const hour = i + 1;
                return <option key={hour} value={hour}>{hour}</option>;
              })}
            </select>
            <span className="text-sm text-primary-700">:</span>
            <select
              value={endSelection.minute}
              onChange={(e) => {
                const newSelection = { ...endSelection, minute: e.target.value };
                onUpdate(index, 'endTime', timeSelectionToString(newSelection));
              }}
              className="px-2 py-1.5 text-sm bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500"
            >
              {['00', '15', '30', '45'].map(min => (
                <option key={min} value={min}>{min}</option>
              ))}
            </select>
            <select
              value={endSelection.period}
              onChange={(e) => {
                const newSelection = { ...endSelection, period: e.target.value as 'AM' | 'PM' };
                onUpdate(index, 'endTime', timeSelectionToString(newSelection));
              }}
              className="px-2 py-1.5 text-sm bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-secondary-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>

            <button
              onClick={() => onRemove(index)}
              className="p-1.5 text-error-500 hover:bg-error-50 rounded-lg transition-all ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function MeetupScheduler({ onScheduleSelect, initialAvailability }: MeetupSchedulerProps) {
  const [mode, setMode] = useState<'specific' | 'recurring'>('specific');
  const [specificDates, setSpecificDates] = useState<DateAvailability[]>(initialAvailability?.specific || []);
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern | null>(initialAvailability?.recurring || null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentTimeSlots, setCurrentTimeSlots] = useState<TimeSlot[]>([]);

  const daysOfWeek: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate time options (15-minute intervals)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Get next 30 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      dates.push(futureDate);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const formatDateDisplay = (dateObj: Date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      dayName: dayNames[dateObj.getDay()],
      date: dateObj.getDate(),
      month: monthNames[dateObj.getMonth()],
      fullDate: dateObj.toISOString().split('T')[0]
    };
  };

  const formatTimeDisplay = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Convert 24-hour time string to TimeSelection
  const timeStringToSelection = (timeStr: string): TimeSelection => {
    const [hours, minutes] = timeStr.split(':');
    const hour24 = parseInt(hours);
    const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return {
      hour: hour12.toString(),
      minute: minutes,
      period
    };
  };

  // Convert TimeSelection to 24-hour time string
  const timeSelectionToString = (selection: TimeSelection): string => {
    let hour24 = parseInt(selection.hour);
    if (selection.period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selection.period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${selection.minute}`;
  };

  const addTimeSlot = () => {
    setCurrentTimeSlots([...currentTimeSlots, { startTime: '09:00', endTime: '17:00' }]);
  };

  const removeTimeSlot = (index: number) => {
    setCurrentTimeSlots(currentTimeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...currentTimeSlots];
    updated[index][field] = value;
    setCurrentTimeSlots(updated);
  };

  const saveSpecificDate = () => {
    if (!selectedDate || currentTimeSlots.length === 0) return;

    const existingIndex = specificDates.findIndex(d => d.date === selectedDate);
    let updated;

    if (existingIndex >= 0) {
      updated = [...specificDates];
      updated[existingIndex] = { date: selectedDate, timeSlots: currentTimeSlots };
    } else {
      updated = [...specificDates, { date: selectedDate, timeSlots: currentTimeSlots }];
    }

    setSpecificDates(updated);
    onScheduleSelect({ specific: updated, recurring: recurringPattern });
    setCurrentTimeSlots([]);
    setSelectedDate('');
  };

  const removeSpecificDate = (date: string) => {
    const updated = specificDates.filter(d => d.date !== date);
    setSpecificDates(updated);
    onScheduleSelect({ specific: updated, recurring: recurringPattern });
  };

  const toggleRecurringDay = (day: DayOfWeek) => {
    const currentDays = recurringPattern?.daysOfWeek || [];
    const updated = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];

    const pattern = { daysOfWeek: updated, timeSlots: recurringPattern?.timeSlots || [] };
    setRecurringPattern(pattern);
    onScheduleSelect({ specific: specificDates, recurring: pattern });
  };

  const saveRecurringPattern = () => {
    if (!recurringPattern || currentTimeSlots.length === 0) return;

    const pattern = { ...recurringPattern, timeSlots: currentTimeSlots };
    setRecurringPattern(pattern);
    onScheduleSelect({ specific: specificDates, recurring: pattern });
    setCurrentTimeSlots([]);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('specific')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'specific'
            ? 'bg-secondary-500 text-accent-700 border-2 border-secondary-600'
            : 'bg-primary-100 text-accent-600 border-2 border-primary-200 hover:border-secondary-300'
            }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Specific Dates
        </button>
        <button
          onClick={() => setMode('recurring')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'recurring'
            ? 'bg-secondary-500 text-accent-700 border-2 border-secondary-600'
            : 'bg-primary-100 text-accent-600 border-2 border-primary-200 hover:border-secondary-300'
            }`}
        >
          <Repeat className="w-4 h-4 inline mr-1.5" />
          Recurring Schedule
        </button>
      </div>

      {/* Specific Dates Mode */}
      {mode === 'specific' && (
        <div className="space-y-3">
          {/* Date Selection */}
          <div>
            <label className="block text-xs font-medium text-accent-700 mb-2">Select Date</label>
            <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-1">
              {availableDates.map((dateObj) => {
                const { dayName, date: dayNum, month, fullDate } = formatDateDisplay(dateObj);
                const isSelected = selectedDate === fullDate;
                const hasAvailability = specificDates.some(d => d.date === fullDate);

                return (
                  <button
                    key={fullDate}
                    onClick={() => {
                      setSelectedDate(fullDate);
                      const existing = specificDates.find(d => d.date === fullDate);
                      setCurrentTimeSlots(existing ? existing.timeSlots : []);
                    }}
                    className={`
                      p-2 rounded-lg border-2 transition-all text-center relative
                      ${isSelected
                        ? 'border-secondary-500 bg-secondary-50 shadow-md'
                        : hasAvailability
                          ? 'border-secondary-300 bg-secondary-50/50'
                          : 'border-primary-200 hover:border-secondary-300 hover:bg-primary-50'
                      }
                    `}
                  >
                    {hasAvailability && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-secondary-600 rounded-full"></div>
                    )}
                    <div className={`text-xs font-medium ${isSelected ? 'text-secondary-600' : 'text-primary-700'}`}>
                      {dayName}
                    </div>
                    <div className={`text-lg font-bold ${isSelected ? 'text-accent-700' : 'text-accent-600'}`}>
                      {dayNum}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-secondary-600' : 'text-primary-600'}`}>
                      {month}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots for Selected Date */}
          {selectedDate && (
            <div className="p-3 bg-primary-100 rounded-lg border border-primary-300">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-accent-700">Time Slots</label>
                <button
                  onClick={addTimeSlot}
                  className="text-xs px-2 py-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700 rounded-lg transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Slot
                </button>
              </div>
              <TimeSlotPicker
                slots={currentTimeSlots}
                onUpdate={updateTimeSlot}
                onRemove={removeTimeSlot}
              />
              {currentTimeSlots.length > 0 && (
                <Button
                  onClick={saveSpecificDate}
                  className="w-full mt-3 bg-secondary-500 hover:bg-secondary-600 text-accent-700"
                >
                  Save Availability
                </Button>
              )}
            </div>
          )}

          {/* Saved Specific Dates */}
          {specificDates.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-accent-700">Your Availability</label>
              {specificDates.map((dateAvail) => (
                <div key={dateAvail.date} className="p-2 bg-secondary-50 border border-secondary-300 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-accent-700">
                        {new Date(dateAvail.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="text-xs text-primary-700 mt-1 space-y-1">
                        {dateAvail.timeSlots.map((slot, idx) => (
                          <div key={idx}>
                            {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSpecificDate(dateAvail.date)}
                      className="p-1 text-error-500 hover:bg-error-50 rounded transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recurring Schedule Mode */}
      {mode === 'recurring' && (
        <div className="space-y-3">
          {/* Day Selection */}
          <div>
            <label className="block text-xs font-medium text-accent-700 mb-2">Select Days</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {daysOfWeek.map((day) => {
                const isSelected = recurringPattern?.daysOfWeek.includes(day) || false;
                return (
                  <button
                    key={day}
                    onClick={() => toggleRecurringDay(day)}
                    className={`
                      px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium
                      ${isSelected
                        ? 'border-secondary-500 bg-secondary-500 text-accent-700'
                        : 'border-primary-200 hover:border-secondary-300 text-accent-600'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots for Recurring Pattern */}
          <div className="p-3 bg-primary-100 rounded-lg border border-primary-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-accent-700">Time Slots</label>
              <button
                onClick={addTimeSlot}
                className="text-xs px-2 py-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700 rounded-lg transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Slot
              </button>
            </div>
            <TimeSlotPicker
              slots={currentTimeSlots}
              onUpdate={updateTimeSlot}
              onRemove={removeTimeSlot}
            />
            {currentTimeSlots.length > 0 && recurringPattern && recurringPattern.daysOfWeek.length > 0 && (
              <Button
                onClick={saveRecurringPattern}
                className="w-full mt-3 bg-secondary-500 hover:bg-secondary-600 text-accent-700"
              >
                Save Recurring Pattern
              </Button>
            )}
          </div>

          {/* Saved Recurring Pattern */}
          {recurringPattern && recurringPattern.timeSlots.length > 0 && (
            <div className="p-3 bg-secondary-50 border-2 border-secondary-500 rounded-lg">
              <p className="text-xs text-primary-700 mb-2">Recurring Availability:</p>
              <p className="text-sm font-semibold text-accent-700 mb-2">
                Every {recurringPattern.daysOfWeek.join(', ')}
              </p>
              <div className="text-xs text-primary-700 space-y-1">
                {recurringPattern.timeSlots.map((slot, idx) => (
                  <div key={idx}>
                    {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
