"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
    value?: Date | string;
    onChange: (date: Date) => void;
    placeholder?: string;
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Chọn ngày giờ",
}: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );

    // Update internal state when prop changes
    React.useEffect(() => {
        if (value) {
            setDate(new Date(value));
        }
    }, [value]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        // Keep the time from the current date if it exists
        const newDate = new Date(selectedDate);
        if (date) {
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
        } else {
            // Default to current time if no previous date
            const now = new Date();
            newDate.setHours(now.getHours());
            newDate.setMinutes(now.getMinutes());
        }

        setDate(newDate);
        onChange(newDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeStr = e.target.value;
        if (!timeStr) return;

        const [hours, minutes] = timeStr.split(":").map(Number);

        const newDate = date ? new Date(date) : new Date();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);

        setDate(newDate);
        onChange(newDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy HH:mm") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                />
                <div className="p-3 border-t border-border">
                    <Input
                        type="time"
                        value={date ? format(date, "HH:mm") : ""}
                        onChange={handleTimeChange}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
