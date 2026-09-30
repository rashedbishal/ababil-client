import logo from '../../../images/landing/ababil-logo.webp';

export default function SiteFooter({ phone }: { phone: string | null }) {
    return (
        <footer className="border-t border-white/10 bg-neutral-950 py-10">
            <div className="mx-auto max-w-6xl space-y-4 px-4 text-center font-bengali sm:px-6">
                <img
                    src={logo}
                    alt="Ababil"
                    className="mx-auto h-10 w-10 rounded-lg"
                />

                <p className="mx-auto max-w-xl text-xs text-neutral-500">
                    এই পণ্যটি কোনো রোগের চিকিৎসা বা নিরাময়ের দাবি করে না। ব্যবহারের আগে
                    পণ্যের গায়ে দেওয়া নির্দেশনা ও সতর্কতা মনোযোগ সহকারে পড়ুন। গুরুতর বা
                    দীর্ঘস্থায়ী ব্যথার ক্ষেত্রে চিকিৎসকের পরামর্শ নিন।
                </p>

                {phone && <p className="text-sm text-neutral-400">{phone}</p>}

                <p className="text-xs text-neutral-600">
                    © {new Date().getFullYear()} আবাবিল। সর্বস্বত্ব সংরক্ষিত।
                </p>
            </div>
        </footer>
    );
}
