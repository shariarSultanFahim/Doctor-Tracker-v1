"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
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
        today: "font-bold text-primary border border-primary/50 rounded-md",
        selected: "bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-30",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
