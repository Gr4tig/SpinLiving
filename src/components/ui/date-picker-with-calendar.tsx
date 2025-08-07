"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SingleCalendar } from "@/components/ui/single-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithCalendarProps {
  date?: Date;
  onDateChange: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  fromMonth?: Date;
  toMonth?: Date;
}

export function DatePickerWithCalendar({
  date,
  onDateChange,
  placeholder = "Sélectionnez une date",
  className,
  disabled = false,
  disabledDates,
  fromMonth,
  toMonth,
}: DatePickerWithCalendarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            "bg-white/10",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd MMMM yyyy", { locale: fr }) : placeholder}
          {date && (
            <X 
              className="ml-auto h-4 w-4 hover:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(undefined);
              }} 
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <SingleCalendar
          date={date}
          onSelect={date => {
            onDateChange(date);
            setOpen(false);
          }}
          disabled={disabledDates}
          fromMonth={fromMonth}
          toMonth={toMonth}
        />
      </PopoverContent>
    </Popover>
  );
}