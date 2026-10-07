import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function parseLocalDate(value: string): Date | undefined {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

type DatePickerProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    disabled?: (date: Date) => boolean;
};

export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    className,
    id,
    disabled,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = value ? parseLocalDate(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    className={cn(
                        'w-40 justify-start gap-1.5 text-left font-normal',
                        !selected && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="size-3.5" />
                    {selected
                        ? selected.toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                          })
                        : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        onChange(date ? toLocalDateString(date) : '');
                        setOpen(false);
                    }}
                    disabled={disabled}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
