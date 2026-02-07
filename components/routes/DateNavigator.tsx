'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DateNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const { t } = useTranslation();
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => onDateChange(subDays(date, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] gap-2">
            <CalendarIcon className="h-4 w-4" />
            {format(date, 'MMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                onDateChange(d);
                setCalendarOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={() => onDateChange(addDays(date, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDateChange(new Date())}
        className="text-muted-foreground text-xs"
      >
        {t('common:today', { defaultValue: 'Today' })}
      </Button>
    </div>
  );
}
