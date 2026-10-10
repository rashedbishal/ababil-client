import uspHerbal from '../../../images/landing/cards/usp-herbal-original.webp';

const ingredients = [
    { name: 'বোসওয়েলিয়া', code: '01 / BOSWELLIA' },
    { name: 'আর্নিকা', code: '02 / ARNICA' },
    { name: 'টি ট্রি', code: '03 / TEA TREE' },
    { name: 'ইউক্যালিপটাস', code: '04 / EUCALYPTUS' },
    { name: 'ভিটামিন-ই', code: '05 / VITAMIN E' },
];

/**
 * Concept 3's "প্রকৃতি থেকে যত্ন" editorial section. Currently not rendered
 * on the page (hidden per the client's request - ingredients aren't
 * disclosed) but kept here, styled, in case it's switched back on later.
 */
export default function Concept3IngredientsSection({
    onOrderClick,
}: {
    onOrderClick: () => void;
}) {
    return (
        <section
            id="ingredients"
            className="scroll-mt-24 bg-gradient-to-b from-amber-50 via-white to-amber-50"
        >
            <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-20">
                <div>
                    <h2 className="font-bengali text-[29px] font-bold text-stone-900 sm:text-4xl">
                        প্রকৃতি থেকে যত্ন
                    </h2>
                    <p className="mt-3 font-bengali text-base leading-relaxed text-stone-600 sm:max-w-md">
                        দৈনন্দিন ম্যাসাজের সঙ্গী — বোসওয়েলিয়া, আর্নিকা, টি ট্রি,
                        ইউক্যালিপটাস ও ভিটামিন-ইয়ের সংমিশ্রণ।
                    </p>
                </div>

                <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm shadow-amber-900/5 sm:p-10">
                    <button
                        type="button"
                        onClick={onOrderClick}
                        aria-label="হারবাল উপাদানের ছবি — অর্ডার করুন"
                        className="group relative mx-auto mb-7 block aspect-square w-full max-w-[310px] overflow-hidden rounded-2xl"
                    >
                        <img
                            src={uspHerbal}
                            alt="হারবাল উপাদানের ছবি"
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                        />
                        <span className="absolute right-2.5 bottom-2.5 inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-3 py-1.5 font-bengali text-xs font-bold text-stone-950">
                            অর্ডার করুন →
                        </span>
                    </button>

                    <h3 className="mb-5 font-bengali text-sm font-semibold tracking-[2px] text-amber-700">
                        প্রধান উপাদান
                    </h3>
                    <ul>
                        {ingredients.map((item) => (
                            <li
                                key={item.code}
                                className="flex items-center justify-between border-b border-amber-100 py-3.5 font-bengali text-lg text-stone-900 last:border-0"
                            >
                                {item.name}
                                <span className="font-sans text-xs text-stone-400">
                                    {item.code}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
