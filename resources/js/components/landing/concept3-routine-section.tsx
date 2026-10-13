import problemKnee from '../../../images/landing/cards/problem-knee.webp';
import routineBackStairs from '../../../images/landing/cards/routine-back-stairs.webp';
import routineFootSole from '../../../images/landing/cards/routine-foot-sole.webp';
import routineKneeStairs from '../../../images/landing/cards/routine-knee-stairs.webp';
import routineShoulderShop from '../../../images/landing/cards/routine-shoulder-shop.webp';
import routineWaistChores from '../../../images/landing/cards/routine-waist-chores.webp';

// One photo per place on the body that commonly hurts, top to bottom - the
// section heading names them. Photos aren't used anywhere else on the page.
const steps = [
    {
        id: 'shoulder-shop',
        image: routineShoulderShop,
        alt: 'দোকান বন্ধের পর কাঁধে হাত রেখে বিশ্রাম নিচ্ছেন একজন দোকানি',
        title: 'সারাদিনের কাজে কাঁধে ব্যথা',
    },
    {
        id: 'back-stairs',
        image: routineBackStairs,
        alt: 'সিঁড়ি ভাঙতে পিঠ-কোমরে ব্যথা পাচ্ছেন একজন বয়স্ক মানুষ',
        title: 'সিঁড়ি বেয়ে ওঠায় পিঠে ব্যথা',
    },
    {
        id: 'waist-chores',
        image: routineWaistChores,
        alt: 'ভারী বালতি নামিয়ে কোমরে হাত রেখেছেন একজন নারী',
        title: 'ভারী কাজের পর কোমরে টান',
    },
    {
        id: 'knee',
        image: problemKnee,
        alt: 'হাঁটু ভাঁজ করতে ব্যথায় কষ্ট পাচ্ছেন একজন যুবক',
        title: 'হাঁটু ভাঁজে কষ্ট',
    },
    {
        id: 'knee-stairs',
        image: routineKneeStairs,
        alt: 'হাঁটুর ব্যথা নিয়ে সিঁড়ি দিয়ে উঠছেন একজন মা',
        title: 'সিঁড়িতে হাঁটুর ব্যথা',
    },
    {
        id: 'foot-sole',
        image: routineFootSole,
        alt: 'পায়ের তলার ব্যথা',
        title: 'পায়ের তলার ব্যথা',
    },
];

/**
 * Concept 3's "where it hurts" section is purely illustrative - unlike the
 * other photo grids, these images are not click-to-order (matches the
 * design's `.usage-photo{cursor:default}` treatment).
 */
export default function Concept3RoutineSection() {
    return (
        <section
            id="routine"
            className="relative scroll-mt-24 overflow-hidden bg-stone-950 py-10 sm:py-16"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.12),transparent_60%)]"
            />
            <div className="relative mx-auto max-w-[1240px] px-4 text-center sm:px-8">
                <h2 className="font-bengali text-[29px] font-bold text-white sm:text-4xl">
                    কাঁধ থেকে পায়ের তলা
                </h2>
                <p className="mt-2 font-bengali text-base text-amber-200/80">
                    কাঁধ, পিঠ, কোমর, হাঁটু কিংবা পা — ব্যথা যেখানেই, আবাবিল সেখানেই।
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
                    {steps.map((step) => (
                        <div key={step.id} className="text-left">
                            <div className="aspect-square overflow-hidden rounded-2xl border border-amber-500/20 bg-stone-900">
                                <img
                                    src={step.image}
                                    alt={step.alt}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            </div>
                            <h3 className="mt-2.5 font-bengali text-base font-medium text-white sm:text-lg">
                                {step.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
