import Link from "next/link";
import { notFound } from "next/navigation";
import { MetaItem } from "@/components/ui/MetaItem";
import { SummaryItem } from "@/components/ui/SummaryItem";
import { displayValue, formatDate } from "@/lib/formatters";
import {
    markRequestContacted,
    markRequestUncontacted,
} from "@/server/actions/requests";
import { getRequestById, type RequestInboxItem } from "@/server/queries/requests";

type RequestDetailPageProps = {
    params:
    | Promise<{
        id: string;
    }>
    | {
        id: string;
    };
};

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
    params,
}: RequestDetailPageProps) {
    const resolvedParams = await params;
    const request = await getRequestById(resolvedParams.id);

    if (!request) {
        notFound();
    }

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/requests"
                            className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                        >
                            ← Back to Requests
                        </Link>

                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                            Request Detail
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                                {displayValue(request.name)}
                            </h1>

                            <ContactedBadge contacted={request.contacted} />
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Full administrative view of this SystemRequest record.
                        </p>
                    </div>

                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                        Created {formatDate(request.createdAt)}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <RequestDetailsPanel request={request} />
                </div>

                <aside className="space-y-4">
                    <RequestActions request={request} />
                    <SummaryCard request={request} />
                </aside>
            </section>
        </main>
    );
}

function RequestDetailsPanel({ request }: { request: RequestInboxItem }) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">
                Request Information
            </h2>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <MetaItem label="Name" value={request.name} />
                <MetaItem label="Business" value={request.business} />
                <MetaItem label="Email" value={request.email} />
                <MetaItem label="Type" value={request.type} />
                <MetaItem label="Referral Code" value={request.referralCode} />
                <MetaItem label="Budget" value={request.budget} />
                <MetaItem
                    label="Contacted Status"
                    value={request.contacted ? "Contacted" : "New"}
                />
                <MetaItem label="Created Date" value={formatDate(request.createdAt)} />
            </dl>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                    Details
                </h3>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {displayValue(request.details)}
                </p>
            </div>
        </section>
    );
}

function RequestActions({ request }: { request: RequestInboxItem }) {
    const action = request.contacted
        ? markRequestUncontacted.bind(null, request.id)
        : markRequestContacted.bind(null, request.id);

    return (
        <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">Request Actions</h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
                This only changes the contacted status. It does not email the client,
                create an agreement, or delete the request.
            </p>

            <form action={action} className="mt-5">
                <button
                    type="submit"
                    className={
                        request.contacted
                            ? "w-full rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-yellow-500/30 hover:text-yellow-100"
                            : "w-full rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
                    }
                >
                    {request.contacted ? "Mark New" : "Mark Contacted"}
                </button>
            </form>
        </section>
    );
}

function SummaryCard({ request }: { request: RequestInboxItem }) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">Summary</h2>

            <div className="mt-5 space-y-4">
                <SummaryItem label="Client" value={request.name} />
                <SummaryItem label="Business" value={request.business} />
                <SummaryItem label="Request Type" value={request.type} />
                <SummaryItem label="Budget" value={request.budget} />
            </div>
        </section>
    );
}

function ContactedBadge({ contacted }: { contacted: boolean }) {
    return contacted ? (
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Contacted
        </span>
    ) : (
        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
            New
        </span>
    );
}

