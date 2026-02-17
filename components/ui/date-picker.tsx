"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    label?: string
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function DatePicker({
    date,
    setDate,
    label,
    placeholder = "Pick a date",
    className,
    disabled
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(date)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-6 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:border-orange-500 transition-all text-zinc-900 dark:text-zinc-100",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {date ? formatDate(date) : <span className="text-zinc-400 dark:text-zinc-600">{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        setDate(d)
                        setOpen(false)
                    }}
                    initialFocus
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800"
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 20}
                />
            </PopoverContent>
        </Popover>
    )
}
