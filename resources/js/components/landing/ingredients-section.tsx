import { Leaf } from 'lucide-react';
import angelicaImg from '../../../images/landing/cards/ing-angelica.webp';
import arnicaImg from '../../../images/landing/cards/ing-arnica.webp';
import boswelliaImg from '../../../images/landing/cards/ing-boswellia.webp';
import neroliImg from '../../../images/landing/cards/ing-neroli.webp';
import teatreeImg from '../../../images/landing/cards/ing-teatree.webp';
import vitamineImg from '../../../images/landing/cards/ing-vitamine.webp';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

const ingredients = [
    { name: 'বোসওয়েলিয়া তেল', image: boswelliaImg },
    { name: 'আর্নিকা তেল', image: arnicaImg },
    { name: 'নেরোলি তেল', image: neroliImg },
    { name: 'চুয়ানক্সিয়ং তেল', image: null },
    { name: 'অ্যাঞ্জেলিকা তেল', image: angelicaImg },
    { name: 'লরোক্যাপ্রাম', image: null },
    { name: 'টি ট্রি তেল', image: teatreeImg },
    { name: 'ইউক্যালিপটাস তেল', image: null },
    { name: 'ভিটামিন-ই তেল', image: vitamineImg },
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

                <RevealGroup className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-6">
                    {ingredients.map(({ name, image }) => (
                        <RevealItem
                            key={name}
                            className="flex flex-col items-center gap-2.5 text-center"
                        >
                            <TiltCard
                                strength={10}
                                glare={false}
                                className="relative size-20 overflow-hidden rounded-full border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm sm:size-24"
                            >
                                {image ? (
                                    <img
                                        src={image}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-amber-500">
                                        <Leaf className="size-8" />
                                    </div>
                                )}
                            </TiltCard>
                            <span className="font-bengali text-xs font-medium text-stone-800 sm:text-sm">
                                {name}
                            </span>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
