import { MessageCircle } from 'lucide-react';

function whatsappUrl(number: string | null): string | null {
    if (!number) {
        return null;
    }

    const digits = number.replace(/[^0-9]/g, '');

    return `https://wa.me/${digits}`;
}

function messengerUrl(facebookUrl: string | null): string | null {
    if (!facebookUrl) {
        return null;
    }

    const username = facebookUrl.replace(/\/$/, '').split('/').pop();

    return username ? `https://m.me/${username}` : null;
}

export default function FloatingActions({
    whatsapp,
    facebookUrl,
}: {
    whatsapp: string | null;
    facebookUrl: string | null;
}) {
    const wa = whatsappUrl(whatsapp);
    const messenger = messengerUrl(facebookUrl);

    if (!wa && !messenger) {
        return null;
    }

    return (
        <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-3 sm:right-6 sm:bottom-6">
            {messenger && (
                <a
                    href={messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Messenger এ মেসেজ করুন"
                    className="flex size-12 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg shadow-black/30 transition hover:scale-105 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                    <MessengerIcon className="size-6" />
                </a>
            )}
            {wa && (
                <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp এ মেসেজ করুন"
                    className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition hover:scale-105 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                    <MessageCircle className="size-6 fill-white" />
                </a>
            )}
        </div>
    );
}

function MessengerIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M12 2C6.477 2 2 6.145 2 11.25c0 2.9 1.446 5.487 3.71 7.178V22l3.39-1.86c.906.25 1.87.386 2.9.386 5.523 0 10-4.145 10-9.276C22 6.145 17.523 2 12 2zm1.008 12.49-2.55-2.72-4.977 2.72 5.475-5.81 2.613 2.72 4.914-2.72-5.475 5.81z" />
        </svg>
    );
}
