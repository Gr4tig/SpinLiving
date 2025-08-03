import * as React from "react"
import { DayPicker, SelectionState, type DateRange } from "react-day-picker"
import "react-day-picker/style.css"
import { format } from "date-fns";
import { fr } from "react-day-picker/locale";
/**
 * Calendar v2 — wrapper autour de DayPicker v9+
 * - mode="range"
 * - 2 mois affichés
 * - animation
 * - styling minimal
 */
export type CalendarProps = {
  dateRange: DateRange
  onSelect: (range: DateRange) => void
}

export function Calendar({ dateRange, onSelect }: CalendarProps) {
  return (
    <DayPicker
      animate
      mode="range"
      selected={dateRange}
      onSelect={onSelect}
      numberOfMonths={2}
      className="bg-white/5 rounded-lg border border-white/10 p-4 {classNames}"
      locale={fr}
      formatters={{
        formatWeekdayName: (day) =>
          format(day, "EEEEEE", { locale: fr }), // ex. "Lu", "Ma", "Me"…
      }}
      classNames={{
        range_middle: "bg-primary/20 text-white",
        range_start: "bg-primary/40 text-white rounded-l-lg",
        range_end: "bg-primary/40 text-white rounded-r-lg",
        selected: "bg-primary text-white",
        today: "text-primary",
      }}
    />
  )
}

Calendar.displayName = "Calendar"