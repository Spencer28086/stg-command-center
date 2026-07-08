import type { LucideIcon } from "lucide-react";

type StatCardProps = {
    title: string;
    value: string;
    detail: string;
    icon: LucideIcon;
};

export function StatCard({ title, value, detail, icon: Icon }: StatCardProps) {
    return (
        <article className="group rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30 transition hover:border-[#d4af37]/35 hover:bg-[#0d0b07]/80">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-stone-400">{title}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                        {value}
                    </p>
                </div>

                <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3 text-[#d4af37] transition group-hover:shadow-[0_0_35px_rgba(212,175,55,0.14)]">
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-stone-500">{detail}</p>
        </article>
    );
}