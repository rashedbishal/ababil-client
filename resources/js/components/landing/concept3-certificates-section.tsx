import { ShieldCheck } from 'lucide-react';

export type CertificateItem = {
    id: number;
    title: string;
    subtitle: string | null;
    image: string;
};

export default function Concept3CertificatesSection({
    items,
}: {
    items: CertificateItem[];
}) {
    if (items.length === 0) {
        return null;
    }

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
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        {items.map((cert) => (
                            <div
                                key={cert.id}
                                className="flex h-full flex-col justify-between rounded-[18px] border border-amber-100 bg-white p-2 shadow-[0_20px_50px_-30px_rgba(120,90,20,0.35)] sm:p-3"
                            >
                                <div className="flex min-h-[11rem] items-center justify-center overflow-hidden rounded-[14px] bg-stone-50 p-2 sm:min-h-[16rem]">
                                    <img
                                        src={cert.image}
                                        alt={cert.title}
                                        className="h-auto max-h-[11rem] w-full rounded-[10px] object-contain sm:max-h-[16rem]"
                                    />
                                </div>

                                {(cert.subtitle || cert.title) && (
                                    <div className="mt-3 flex min-h-[4.5rem] items-center justify-center text-center">
                                        <div>
                                            <p className="font-bengali text-base font-semibold text-stone-900 sm:text-lg">
                                                {cert.title}
                                            </p>
                                            {cert.subtitle && (
                                                <p className="mt-1 text-xs text-stone-600 sm:text-sm">
                                                    {cert.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
