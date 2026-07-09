import { Mails } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/formatters";
import { getWaitlist } from "@/server/queries/waitlist";

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
    const { entries, counts } = await getWaitlist();

    return (
        <main className="space-y-6">
            <PageHeader
                title="Waitlist"
                description="Read-only view of website waitlist signups. Entries are captured by the STG site waitlist form."
            />

            <section className="grid gap-4 sm:grid-cols-3">
                <StatChip label="Total Signups" value={counts.total} />
                <StatChip label="Last 7 Days" value={counts.last7Days} />
                <StatChip label="Last 30 Days" value={counts.last30Days} />
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-lg shadow-black/20">
                {entries.length > 0 ? (
                    <ul className="divide-y divide-zinc-800/80">
                        {entries.map((entry) => (
                            <li
                                key={entry.id}
                                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Mails className="h-4 w-4 shrink-0 text-yellow-500/60" />
                                    <span className="break-all text-sm text-zinc-200">
                                        {entry.email}
                                    </span>
                                </div>
                                <span className="text-sm text-zinc-500">
                                    Joined {formatDate(entry.createdAt)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-lg font-semibold text-zinc-100">
                            No waitlist signups yet
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Entries will appear here as visitors join the
                            waitlist on the STG website.
                        </p>
                    </div>
                )}
            </section>

            {counts.total > entries.length ? (
                <p className="text-sm text-zinc-500">
                    Showing the {entries.length} most recent of {counts.total}{" "}
                    total signups.
                </p>
            ) : null}
        </main>
    );
}

function StatChip({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-[#d4af37]/15 bg-black/45 p-5 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {value}
            </p>
        </div>
    );
}
