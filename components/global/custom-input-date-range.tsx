import * as React from "react";
import { format, startOfDay, isBefore, isAfter } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils"

interface DatePickerWithRangeProps {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  onBlur?: () => void;
  formatValue?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  align?: "center" | "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
  showClear?: boolean;
}

export const DatePickerWithRange = React.forwardRef<
  HTMLDivElement,
  DatePickerWithRangeProps
>(
  (
    {
      value,
      onChange,
      onBlur,
      formatValue = "dd-MM-yyyy",
      minDate,
      maxDate,
      placeholder = "Pick a date",
      align = "start",
      side = "bottom",
      showClear = false,
    },
    ref,
  ) => {
    // State untuk menyimpan tanggal, default undefined
    const [date, setDate] = React.useState<DateRange | undefined>(
      value || undefined,
    );

    // State untuk mengontrol Popover
    const [open, setOpen] = React.useState(false);

    // Ref untuk button utama
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Normalisasi batas tanggal (agar selalu di awal hari)
    const normalizedMinDate = minDate ? startOfDay(minDate) : undefined;
    const normalizedMaxDate = maxDate ? startOfDay(maxDate) : undefined;

    // Handle pemilihan tanggal
    const handleSelect = (newDate: DateRange | undefined) => {
      if (newDate?.from) {
        const normalizedFrom = startOfDay(newDate.from);
        const normalizedTo = newDate.to ? startOfDay(newDate.to) : undefined;

        // Validasi apakah tanggal dalam batas yang diizinkan
        if (
          (normalizedMinDate && isBefore(normalizedFrom, normalizedMinDate)) ||
          (normalizedMaxDate &&
            normalizedTo &&
            isAfter(normalizedTo, normalizedMaxDate))
        ) {
          return;
        }
      }

      setDate(newDate);
      onChange?.(newDate);
    };

    // Handle clear date
    const handleClear = () => {
      setDate(undefined);
      onChange?.(undefined);
      setOpen(false);
    };

    return (
      <div className="grid gap-2">
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                ref={buttonRef}
                variant={"outline"}
                onBlur={onBlur}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date?.from && "text-muted-foreground",
                )}
              >
                <span className="flex-1 truncate">
                  {(() => {
                    if (!date?.from) {
                      return <span>{placeholder}</span>;
                    }

                    if (date.to) {
                      return (
                        <>
                          {format(date.from, formatValue)} -{" "}
                          {format(date.to, formatValue)}
                        </>
                      );
                    }

                    return format(date.from, formatValue);
                  })()}
                </span>
                <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              ref={ref}
              side={side}
              align={align}
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
                fromDate={normalizedMinDate}
                toDate={normalizedMaxDate}
                disabled={(date) => {
                  const normalizedDate = startOfDay(date);
                  return Boolean(
                    (normalizedMinDate &&
                      isBefore(normalizedDate, normalizedMinDate)) ||
                    (normalizedMaxDate &&
                      isAfter(normalizedDate, normalizedMaxDate)),
                  );
                }}
              />
            </PopoverContent>
          </Popover>

          {date?.from && showClear && (
            <button
              onClick={handleClear}
              className="absolute right-9 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              type="button"
              aria-label="Clear date selection"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  },
);

DatePickerWithRange.displayName = "DatePickerWithRange";
