import { Gift } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/formatters";
import {
    getReferralTracker,
    type ReferralEvent,
    type ReferrerSummary,
} from "@/server/queries/referrals";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
    const { referrers, events, totals } = await getReferralTracker();

    return (
        <main className="space-y-6">
            <PageHeader
                title="Referral Tracker"
                description="Referral codes, qualified referrals, and credits. Partnership referrers are uncapped — credits bank and apply to one monthly payment each. Pay-in-full referrers cap at 20."
            />

            <section className="grid gap-4 sm:grid-cols-3">
                <StatChip label="Qualified" value={String(totals.qualified)} />
                <StatChip label="Pending" value={String(totals.pending)} />
                <StatChip
                    label="Credits Issued"
                    value={`$${totals.creditsIssued.toLocaleString()}`}
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Referrers
                </h2>

                {referrers.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {referrers.map((referrer) => (
                            <ReferrerCard
                                key={referrer.agreementId}
                                referrer={referrer}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                        <h3 className="text-lg font-semibold text-zinc-100">
                            No referrers yet
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400">
                            Signed agreements with referral codes will appear
                            here.
                        </p>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Recent Referrals
                </h2>

                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <EventRow key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                        <h3 className="text-lg font-semibold text-zinc-100">
                            No referrals recorded yet
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400">
                            Referrals are created when a new agreement includes
                            a &ldquo;referred by&rdquo; code, and qualify when
                            that agreement is signed.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

function StatChip({ label, value }: { label: string; value: string }) {
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

function ReferrerCard({ referrer }: { referrer: ReferrerSummary }) {
    return (
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-50">
                        {referrer.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        {referrer.tier} · {referrer.paymentStructure} · $
                        {referrer.rewardAmount}/referral
                    </p>
                </div>
                <span className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-yellow-200">
                    {referrer.code}
                </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Qualified
                    </dt>
                    <dd className="mt-1 text-xl font-semibold text-white">
                        {referrer.qualified}
                    </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Pending
                    </dt>
                    <dd className="mt-1 text-xl font-semibold text-white">
                        {referrer.pending}
                    </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Earned
                    </dt>
                    <dd className="mt-1 text-xl font-semibold text-[#f5d77b]">
                        ${referrer.creditsEarned.toLocaleString()}
                        <span className="text-sm font-normal text-stone-500">
                            {referrer.uncapped
                                ? " / uncapped"
                                : ` / $${(referrer.maxCredit ?? 0).toLocaleString()}`}
                        </span>
                    </dd>
                </div>
            </dl>
        </article>
    );
}

function EventRow({ event }: { event: ReferralEvent }) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-5 py-4 shadow-lg shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
                <Gift className="h-4 w-4 shrink-0 text-yellow-500/60" />
                <p className="text-sm text-zinc-200">
                    <span className="font-semibold">{event.referrerName}</span>{" "}
                    referred{" "}
                    <span className="font-semibold">{event.referredName}</span>{" "}
                    <span className="font-mono text-xs text-yellow-200/80">
                        ({event.code})
                    </span>
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
                {event.status === "QUALIFIED" ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Qualified · ${event.referrerCreditAmount ?? 0} / $
                        {event.refereeCreditAmount ?? 0}
                    </span>
                ) : event.status === "PENDING" ? (
                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                        Pending Signature
                    </span>
                ) : (
                    <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs font-semibold text-zinc-400">
                        {event.status}
                    </span>
                )}
                <span className="text-zinc-500">
                    {formatDate(event.createdAt)}
                </span>
            </div>
        </div>
    );
}
