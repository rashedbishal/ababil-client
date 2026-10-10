function whatsappUrl(number: string | null): string | null {
    if (!number) {
        return null;
    }

    return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
}

/** Concept 3's "আগে একটু কথা হোক" pre-purchase contact box. */
export default function Concept3ContactSection({
    whatsapp,
}: {
    whatsapp: string | null;
}) {
    const wa = whatsappUrl(whatsapp);

    return (
        <section className="bg-white">
            <div className="mx-auto max-w-[1240px] px-4 pb-12 sm:px-8">
                <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm shadow-amber-900/5 sm:flex-row sm:items-center sm:p-9">
                    <div>
                        <p className="font-bengali text-sm font-semibold text-amber-700">
                            কেনার আগে জানতে চান?
                        </p>
                        <h3 className="mt-2 font-bengali text-2xl font-semibold text-stone-900 sm:text-[29px]">
                            আগে একটু কথা হোক
                        </h3>
                        <p className="mt-1 font-bengali text-base text-stone-600">
                            কেনার আগে যা জানতে চান, আমাদের লিখুন।
                        </p>
                    </div>

                    {wa && (
                        <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#11833d] bg-[#128c46] px-5 py-3.5 font-bengali text-base font-semibold text-white shadow-[0_7px_18px_#128c4630] transition hover:bg-[#086e34] sm:w-auto sm:whitespace-nowrap"
                        >
                            WhatsApp-এ কথা বলুন
                            <span aria-hidden>↗</span>
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
