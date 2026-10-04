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
        <div className="inline-flex w-fit items-center rounded-xl border border-amber-300 bg-amber-50/80 p-0.5 shadow-sm">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                className="flex size-8 items-center justify-center rounded-lg text-stone-700 transition hover:bg-amber-200/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                aria-label="পরিমাণ কমান"
            >
                <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center font-bengali text-sm font-bold text-stone-900">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                className="flex size-8 items-center justify-center rounded-lg text-stone-700 transition hover:bg-amber-200/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                aria-label="পরিমাণ বাড়ান"
            >
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}
