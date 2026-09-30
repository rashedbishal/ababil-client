import { Leaf } from 'lucide-react';

const ingredients = [
    'বোসওয়েলিয়া তেল',
    'আর্নিকা তেল',
    'নেরোলি তেল',
    'চুয়ানক্সিয়ং তেল',
    'অ্যাঞ্জেলিকা তেল',
    'লরোক্যাপ্রাম',
    'টি ট্রি তেল',
    'ইউক্যালিপটাস তেল',
    'ভিটামিন-ই তেল',
];

export default function IngredientsSection() {
    return (
        <section className="bg-neutral-950 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    ৯টি বিশ্বমানের প্রাকৃতিক উপাদান
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-center font-bengali text-sm text-neutral-400">
                    প্রতিটি উপাদান সতর্কতার সাথে নির্বাচিত, যা একসাথে কাজ করে দ্রুত ও কার্যকর
                    ব্যথা উপশমের জন্য।
                </p>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {ingredients.map((name) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent px-4 py-3.5"
                        >
                            <Leaf className="size-4 shrink-0 text-amber-400" />
                            <span className="font-bengali text-sm text-neutral-200">
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
