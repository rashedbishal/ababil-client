import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({
    value,
    onChange,
    min = 1,
    max = 50,
}: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <div className="inline-flex h-[52px] w-full max-w-[96px] items-center justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-1 shadow-sm">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                className="flex size-9 items-center justify-center rounded-lg text-stone-700 transition hover:bg-amber-200/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                aria-label="পরিমাণ কমান"
            >
                <Minus className="size-4" />
            </button>
            <span className="min-w-7 text-center font-bengali text-sm font-bold text-stone-900">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                className="flex size-9 items-center justify-center rounded-lg text-stone-700 transition hover:bg-amber-200/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                aria-label="পরিমাণ বাড়ান"
            >
                <Plus className="size-4" />
            </button>
        </div>
    );
}
