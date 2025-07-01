'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

interface DatePickerDialogProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  disabled?: (date: Date) => boolean;
}

export function DatePickerDialog({
  value,
  onChange,
  fromYear,
  toYear,
  disabled,
}: DatePickerDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  // Temporary state for the date while the dialog is open
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [month, setMonth] = React.useState<Date>(value || new Date());

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // When the dialog opens, initialize its state with the value from the form
      setSelectedDate(value);
      setMonth(value || new Date());
    }
    setIsOpen(open);
  };

  const handleApply = () => {
    onChange(selectedDate);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 w-auto">
        <DialogHeader className="p-6 pb-2 bg-primary text-primary-foreground rounded-t-lg">
           <DialogTitle className="uppercase tracking-wider font-semibold text-primary-foreground/90">
             {selectedDate ? format(selectedDate, 'yyyy') : 'Date of Birth'}
           </DialogTitle>
          <DialogDescription className="text-primary-foreground text-3xl font-bold">
            {selectedDate ? format(selectedDate, 'E, MMM d') : 'Pick a day'}
          </DialogDescription>
        </DialogHeader>
        <div className="p-3">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            captionLayout="dropdown-buttons"
            fromYear={fromYear}
            toYear={toYear}
            disabled={disabled}
          />
        </div>
        <DialogFooter className="px-6 pb-6 pt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleApply}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
