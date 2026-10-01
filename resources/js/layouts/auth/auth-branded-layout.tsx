import { Link } from '@inertiajs/react';
import ababilLogo from '../../../images/landing/ababil-logo.webp';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthBrandedLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-stone-950 p-6 md:p-10">
            <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-amber-500/10 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-1/3 -right-24 size-96 rounded-full bg-amber-400/10 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(0,0,0,0.3)_100%)]"
            />

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col items-center gap-2">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-2"
                    >
                        <img
                            src={ababilLogo}
                            alt="Ababil"
                            className="size-12 rounded-xl shadow-lg shadow-black/30"
                        />
                        <span className="font-bengali text-lg font-semibold tracking-wide text-amber-300">
                            আবাবিল
                        </span>
                    </Link>
                </div>

                <div className="mt-8 rounded-2xl border border-amber-500/10 bg-white p-6 text-stone-900 shadow-2xl shadow-black/40 sm:p-8">
                    <div className="mb-6 space-y-1 text-center">
                        <h1 className="text-xl font-semibold text-stone-900">
                            {title}
                        </h1>
                        <p className="text-sm text-stone-500">{description}</p>
                    </div>

                    {children}
                </div>

                <Link
                    href={home()}
                    className="mt-6 block text-center text-xs text-stone-500 transition-colors hover:text-amber-300"
                >
                    ← Back to the store
                </Link>
            </div>
        </div>
    );
}
