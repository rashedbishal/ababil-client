import { Leaf } from 'lucide-react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';

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
        <section className="bg-white py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        ৯টি বিশ্বমানের প্রাকৃতিক উপাদান
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-center font-bengali text-sm text-stone-600">
                        প্রতিটি উপাদান সতর্কতার সাথে নির্বাচিত, যা একসাথে কাজ করে দ্রুত ও
                        কার্যকর ব্যথা উপশমের জন্য।
                    </p>
                </Reveal>

                <RevealGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {ingredients.map((name) => (
                        <RevealItem key={name}>
                            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-4 py-3.5 transition-colors hover:border-amber-400">
                                <Leaf className="size-4 shrink-0 text-amber-600" />
                                <span className="font-bengali text-sm text-stone-800">
                                    {name}
                                </span>
                            </div>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
