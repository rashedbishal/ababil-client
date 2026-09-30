const steps = [
    {
        step: '০১',
        title: 'ক্লিনজ',
        description: 'যেখানে ব্যথা অনুভব করছেন সেই স্থানটি হালকা পরিষ্কার করে নিন।',
    },
    {
        step: '০২',
        title: 'পরিমাণমতো নিন',
        description: 'হাতের তালুতে প্রয়োজনমতো অয়েল নিন।',
    },
    {
        step: '০৩',
        title: 'আলতো ম্যাসাজ',
        description: 'বৃত্তাকার ভঙ্গিতে আলতোভাবে ম্যাসাজ করুন যতক্ষণ না শোষিত হয়।',
    },
    {
        step: '০৪',
        title: 'নিয়মিত ব্যবহার',
        description: 'ভালো ফলাফলের জন্য দিনে ২-৩ বার নিয়মিত ব্যবহার করুন।',
    },
];

export default function UsageGuideSection() {
    return (
        <section className="bg-neutral-900/60 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    ব্যবহারের নিয়ম
                </h2>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(({ step, title, description }) => (
                        <div key={step} className="relative">
                            <span className="font-bengali text-5xl font-bold text-amber-500/20">
                                {step}
                            </span>
                            <h3 className="-mt-3 font-bengali text-lg font-semibold text-white">
                                {title}
                            </h3>
                            <p className="mt-1.5 font-bengali text-sm text-neutral-400">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
