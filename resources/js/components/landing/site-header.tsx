import { Phone } from 'lucide-react';
import logo from '../../../images/landing/ababil-logo.webp';
import { Button } from '@/components/ui/button';

export default function SiteHeader({ phone }: { phone: string | null }) {
    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="Ababil"
                        className="h-9 w-9 rounded-lg"
                    />
                    <span className="font-bengali text-lg font-semibold tracking-wide text-white">
                        আবাবিল
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {phone && (
                        <a
                            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                            className="hidden items-center gap-1.5 text-sm text-neutral-300 hover:text-amber-400 sm:flex"
                        >
                            <Phone className="size-4" />
                            {phone}
                        </a>
                    )}

                    <Button
                        asChild
                        size="sm"
                        className="bg-amber-500 font-bengali font-semibold text-neutral-950 hover:bg-amber-400"
                    >
                        <a href="#order">অর্ডার করুন</a>
                    </Button>
                </div>
            </div>
        </header>
    );
}
