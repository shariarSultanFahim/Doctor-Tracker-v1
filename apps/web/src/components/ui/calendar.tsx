"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-background border border-border rounded-lg shadow-sm text-foreground", className)}
      classNames={{
        today: "font-bold text-primary border border-primary/30",
        selected: "bg-primary text-primary-foreground font-semibold rounded-md",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-40",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
