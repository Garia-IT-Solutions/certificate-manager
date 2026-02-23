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
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        }).format(date)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-2.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:border-[#FF3300] transition-all text-zinc-900 dark:text-zinc-100 shadow-sm",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <div className="shrink-0 text-zinc-400 group-hover:text-[#FF3300] transition-colors">
                        <CalendarIcon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-center truncate mx-1 tracking-tight">
                        {date ? formatDate(date) : <span className="text-zinc-400 dark:text-zinc-600">{placeholder}</span>}
                    </span>
                    <div className="shrink-0 w-4 h-4 opacity-0" aria-hidden="true" />
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
