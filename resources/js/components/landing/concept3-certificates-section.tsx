import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

export type CertificateItem = {
    title: string;
    subtitle: string;
    image: string;
};

const certificates: CertificateItem[] = [
    {
        title: 'ISO 22716 GMP',
        subtitle: 'Good Manufacturing Practice Certificate',
        image: '/certificates/images/iso_22716_gmp-1.png',
    },
    {
        title: 'ISO 9001',
        subtitle: 'Quality Management System Certificate',
        image: '/certificates/images/iso_9001-1.png',
    },
    {
        title: 'FDA Approval',
        subtitle: 'Food & Drug Administration Compliance',
        image: '/certificates/images/fda_approval-1.png',
    },
    {
        title: 'Company Certificate',
        subtitle: 'Official business quality assurance',
        image: '/certificates/images/company_certificate-1.png',
    },
];

const DESKTOP_QUERY = '(min-width: 768px)';

function subscribeDesktop(onChange: () => void) {
    const query = window.matchMedia(DESKTOP_QUERY);
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
}

export default function Concept3CertificatesSection() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);

    const isDesktop = useSyncExternalStore(
        subscribeDesktop,
        () => window.matchMedia(DESKTOP_QUERY).matches,
        () => false,
    );

    const perView = isDesktop ? 2 : 1;
    const pageCount = Math.ceil(certificates.length / perView);

    const syncPage = useCallback(() => {
        const track = trackRef.current;

        if (track && track.clientWidth > 0) {
            const nextPage = Math.round(track.scrollLeft / track.clientWidth);
            setPage(nextPage % pageCount);
        }
    }, [pageCount]);

    const goToPage = useCallback(
        (next: number) => {
            const track = trackRef.current;

            if (!track) {
                return;
            }

            const normalized = ((next % pageCount) + pageCount) % pageCount;
            const target = normalized * track.clientWidth;

            track.scrollTo({
                left: target,
                behavior: 'smooth',
            });
            setPage(normalized);
        },
        [pageCount],
    );

    useEffect(() => {
        if (pageCount <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            goToPage(page + 1);
        }, 3500);

        return () => window.clearInterval(interval);
    }, [goToPage, page, pageCount]);

    return (
        <section
            id="certificates"
            className="relative overflow-hidden border-t border-amber-200 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_50%),linear-gradient(180deg,#fffdf8_0%,#fff7eb_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.55),transparent_20%,transparent_80%,rgba(255,255,255,0.45))]" />

            <div className="relative mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase shadow-sm backdrop-blur-sm">
                        <ShieldCheck className="size-3.5" />
                        Quality assurance
                    </div>
                    <h2 className="font-bengali text-3xl font-black text-stone-900 sm:text-4xl">
                        গুণমান ও আস্থার যোগ্যতার সার্টিফিকেট
                    </h2>
                </div>

                <div className="mx-auto mt-8 max-w-[1100px]">
                    <div className="relative">
                        <div
                            ref={trackRef}
                            onScroll={syncPage}
                            className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
                        >
                            {certificates.map((cert) => (
                                <div
                                    key={cert.title}
                                    className="w-full shrink-0 snap-start px-1.5 md:w-1/2"
                                >
                                    <div className="m-auto flex h-[70vh] max-h-[760px] items-center justify-center rounded-[18px] bg-white p-1 shadow-[0_20px_50px_-30px_rgba(120,90,20,0.35)]">
                                        <img
                                            src={cert.image}
                                            alt={cert.title}
                                            className="h-full w-full rounded-[14px] object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pageCount > 1 && (
                            <>
                                <button
                                    type="button"
                                    aria-label="আগের সার্টিফিকেট"
                                    onClick={() => goToPage(page - 1)}
                                    className="absolute top-1/2 left-0 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-white/90 text-stone-700 shadow-lg transition hover:border-amber-300 hover:text-amber-700 sm:size-10 lg:-left-10 lg:translate-x-0"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="পরের সার্টিফিকেট"
                                    onClick={() => goToPage(page + 1)}
                                    className="absolute top-1/2 right-0 z-10 flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-white/90 text-stone-700 shadow-lg transition hover:border-amber-300 hover:text-amber-700 sm:size-10 lg:-right-10 lg:translate-x-0"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {pageCount > 1 && (
                        <div className="mt-5 flex items-center justify-center gap-2.5">
                            {Array.from({ length: pageCount }, (_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`পেজ ${i + 1}`}
                                    aria-current={i === page}
                                    onClick={() => goToPage(i)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        i === page
                                            ? 'w-8 bg-amber-500'
                                            : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
