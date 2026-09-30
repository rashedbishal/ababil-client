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
        <div className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                className="flex size-9 items-center justify-center text-stone-600 transition hover:text-amber-700 disabled:pointer-events-none disabled:opacity-40"
                aria-label="পরিমাণ কমান"
            >
                <Minus className="size-4" />
            </button>
            <span className="w-10 text-center font-bengali text-sm font-semibold text-stone-900">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                className="flex size-9 items-center justify-center text-stone-600 transition hover:text-amber-700 disabled:pointer-events-none disabled:opacity-40"
                aria-label="পরিমাণ বাড়ান"
            >
                <Plus className="size-4" />
            </button>
        </div>
    );
}
