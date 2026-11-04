import { useLogo } from '@/hooks/use-logo';

export default function SiteFooter({ phone }: { phone: string | null }) {
    const logo = useLogo('site');

    return (
        <footer className="border-t border-amber-500/10 bg-stone-950 pt-7 pb-24 sm:py-8">
            <div className="mx-auto max-w-6xl space-y-4 px-4 text-center font-bengali sm:px-6">
                <img src={logo} alt="Ababil" className="mx-auto h-12 w-12" />

                <p className="mx-auto max-w-xl text-xs text-stone-500">
                    সর্বোত্তম ফলাফলের জন্য পণ্যের গায়ে দেওয়া ব্যবহার নির্দেশনা অনুসরণ করুন।
                </p>

                {phone && <p className="text-sm text-stone-400">{phone}</p>}

                <p className="text-xs text-stone-600">
                    © {new Date().getFullYear()} আবাবিল। সর্বস্বত্ব সংরক্ষিত।
                </p>
            </div>
        </footer>
    );
}
