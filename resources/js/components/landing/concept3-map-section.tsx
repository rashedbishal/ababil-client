import mapImage from '../../../images/landing/bangladesh-map.webp';
import OrderTriggerButton from './order-trigger-button';

/** Concept 3's nationwide-delivery section: one big clickable map + a CTA. */
export default function Concept3MapSection({
    onOrderClick,
}: {
    onOrderClick: () => void;
}) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400 px-4 py-10 text-center sm:px-6 sm:py-16">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,250,220,0.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(120,72,0,0.14),transparent_50%)]"
            />

            <div className="relative">
                <span className="inline-block rounded-full border border-stone-900/15 bg-white/40 px-5 py-1.5 font-bengali text-sm font-semibold text-stone-800 backdrop-blur-sm">
                    সারা দেশে হোম ডেলিভারি
                </span>
                <h2 className="mt-5 font-bengali text-3xl font-bold text-stone-900 sm:text-4xl">
                    যত্ন পৌঁছাক ঘরে ঘরে
                </h2>
                <p className="mt-2 font-bengali text-base text-stone-800">
                    নিজের জন্য, কিংবা প্রিয় মানুষটির জন্য।
                </p>

                <button
                    type="button"
                    onClick={onOrderClick}
                    aria-label="বাংলাদেশের মানচিত্র — অর্ডার করুন"
                    className="mx-auto mt-6 block"
                >
                    <img
                        src={mapImage}
                        alt="সারা বাংলাদেশে আবাবিল হোম ডেলিভারি"
                        loading="lazy"
                        className="mx-auto w-full max-w-[480px] object-contain drop-shadow-[0_35px_45px_rgba(87,53,0,0.35)]"
                    />
                </button>

                <div className="mt-4 flex justify-center">
                    <OrderTriggerButton onClick={onOrderClick}>
                        অর্ডার করুন
                    </OrderTriggerButton>
                </div>
            </div>
        </section>
    );
}
