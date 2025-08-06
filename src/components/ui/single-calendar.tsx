import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * SingleCalendar — wrapper autour de DayPicker v9+ pour sélection d'une date unique
 * - mode="single"
 * - 1 mois affiché
 * - styling minimal
 */
export type SingleCalendarProps = {
  date?: Date | undefined
  onSelect: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  fromMonth?: Date
  toMonth?: Date
}

export function SingleCalendar({ 
  date, 
  onSelect, 
  disabled, 
  fromMonth,
  toMonth 
}: SingleCalendarProps) {
  return (
    <DayPicker
      animate
      mode="single"
      selected={date}
      onSelect={onSelect}
      disabled={disabled}
      fromMonth={fromMonth}
      toMonth={toMonth}
      numberOfMonths={1}
      className="bg-[#19191B] rounded-lg border border-gray-800 p-4"
      locale={fr}
      formatters={{
        formatWeekdayName: (day) =>
          format(day, "EEEEEE", { locale: fr }), // ex. "Lu", "Ma", "Me"…
      }}
      classNames={{
        selected: "bg-primary text-white hover:bg-primary/90",
        today: "text-primary font-bold",
        day_disabled: "text-gray-600 opacity-50",
        day: "rounded-md transition-colors hover:bg-gray-700",
        chevron: "bg-primary text-primary hover:bg-primary/90 hover:text-white color-primary rounded-lg",
      }}
    />
  )
}

SingleCalendar.displayName = "SingleCalendar"