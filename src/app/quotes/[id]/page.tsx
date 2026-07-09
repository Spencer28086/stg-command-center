import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteStageBadge } from "@/components/quotes/QuoteStageBadge";
import { MetaItem } from "@/components/ui/MetaItem";
import {
    displayValue,
    formatDate,
    formatMoney,
    formatStatus,
} from "@/lib/formatters";
import { updateQuoteInternalNotes } from "@/server/actions/quotes";
import { getQuoteById, parseStringList } from "@/server/queries/quotes";

type QuoteDetailPageProps = {
    params:
        | Promise<{
              id: string;
          }>
        | {
              id: string;
          };
};

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({
    params,
}: QuoteDetailPageProps) {
    const resolvedParams = await params;
    const quote = await getQuoteById(resolvedParams.id);

    if (!quote) {
        notFound();
    }

    const deliverables = parseStringList(
        quote.proposal?.deliverables ?? quote.includedFeatures,
    );
    const excludedItems = parseStringList(quote.proposal?.excludedItems);
    const updateNotesWithId = updateQuoteInternalNotes.bind(null, quote.id);

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/quotes"
                            className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                        >
                            ← Back to Quotes
                        </Link>

                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                            Quote Detail
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                                {displayValue(quote.projectName)}
                            </h1>
                            <QuoteStageBadge stage={quote.stage} />
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                            <span className="font-mono text-zinc-500">
                                {quote.quoteNumber}
                            </span>
                            {" · "}
                            Raw status: {formatStatus(quote.status)}
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div className="text-sm text-zinc-500">
                            Created {formatDate(quote.createdAt)}
                        </div>
                        {quote.pdfUrl ? (
                            <a
                                href={quote.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Quote PDF
                            </a>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-zinc-50">Client</h2>
                <dl className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetaItem label="Name" value={quote.clientName} />
                    <MetaItem label="Email" value={quote.clientEmail} />
                    <MetaItem label="Business" value={quote.businessName} />
                    <MetaItem
                        label="Source Request"
                        value={
                            quote.sourceRequest
                                ? `${quote.sourceRequest.name} (${quote.sourceRequest.type})`
                                : null
                        }
                    />
                </dl>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Pricing & Structure
                </h2>
                <dl className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetaItem
                        label="Total Cost"
                        value={formatMoney(quote.totalProjectCost)}
                    />
                    <MetaItem
                        label="Deposit"
                        value={formatMoney(quote.depositAmount)}
                    />
                    <MetaItem
                        label="Monthly Payment"
                        value={
                            quote.monthlyPayment
                                ? `${formatMoney(quote.monthlyPayment)}/mo`
                                : null
                        }
                    />
                    <MetaItem
                        label="Payment Structure"
                        value={formatStatus(quote.paymentStructure)}
                    />
                    <MetaItem
                        label="Build Tier"
                        value={quote.selectedBuildTier}
                    />
                    <MetaItem label="Project Type" value={quote.projectType} />
                    <MetaItem label="Care Plan" value={quote.carePlanTier} />
                    <MetaItem
                        label="Care Plan Monthly"
                        value={
                            quote.carePlanMonthly
                                ? `${formatMoney(quote.carePlanMonthly)}/mo`
                                : null
                        }
                    />
                </dl>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                    <h2 className="text-lg font-semibold text-zinc-50">
                        Deliverables
                    </h2>
                    {deliverables.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                            {deliverables.map((item) => (
                                <li
                                    key={item}
                                    className="rounded-xl border border-zinc-800 bg-black/20 px-4 py-2.5 text-sm text-zinc-300"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-sm text-zinc-500">
                            No deliverables recorded.
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                    <h2 className="text-lg font-semibold text-zinc-50">
                        Excluded Items
                    </h2>
                    {excludedItems.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                            {excludedItems.map((item) => (
                                <li
                                    key={item}
                                    className="rounded-xl border border-zinc-800 bg-black/20 px-4 py-2.5 text-sm text-zinc-300"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-sm text-zinc-500">
                            No exclusions recorded.
                        </p>
                    )}
                </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Scope & Timeline
                </h2>
                <div className="mt-4 space-y-4">
                    <TextBlock label="Description" value={quote.projectDescription} />
                    <TextBlock label="Scope Summary" value={quote.scopeSummary} />
                    <TextBlock
                        label="Timeline Summary"
                        value={quote.timelineSummary}
                    />
                    <TextBlock
                        label="Warranty Summary"
                        value={quote.proposal?.warrantySummary ?? null}
                    />
                </div>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                    <MetaItem
                        label="Estimated Start"
                        value={
                            quote.estimatedStartDate
                                ? formatDate(quote.estimatedStartDate)
                                : null
                        }
                    />
                    <MetaItem
                        label="Estimated Launch"
                        value={
                            quote.estimatedLaunchDate
                                ? formatDate(quote.estimatedLaunchDate)
                                : null
                        }
                    />
                </dl>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Client Progress
                </h2>
                <dl className="mt-4 grid gap-4 md:grid-cols-3">
                    <MetaItem
                        label="Quote Viewed"
                        value={
                            quote.onboardingViewedAt
                                ? formatDate(quote.onboardingViewedAt)
                                : "Not yet"
                        }
                    />
                    <MetaItem
                        label="Accepted"
                        value={
                            quote.acceptedAt
                                ? formatDate(quote.acceptedAt)
                                : "Not yet"
                        }
                    />
                    <MetaItem
                        label="Completed"
                        value={
                            quote.completedAt
                                ? formatDate(quote.completedAt)
                                : "Not yet"
                        }
                    />
                </dl>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Internal Notes
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Private to the Command Center and website admin. Never
                    shown to the client.
                </p>
                <form action={updateNotesWithId} className="mt-4 space-y-3">
                    <textarea
                        name="internalNotes"
                        defaultValue={quote.internalNotes ?? ""}
                        rows={4}
                        className="w-full rounded-xl border border-zinc-800 bg-black/30 p-4 text-sm leading-6 text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 focus:outline-none"
                        placeholder="Add internal notes about this quote..."
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                        >
                            Save notes
                        </button>
                    </div>
                </form>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-zinc-50">
                    Audit Trail
                </h2>
                {quote.audits.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                        {quote.audits.map((audit) => (
                            <li
                                key={audit.id}
                                className="flex flex-col gap-1 rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <span className="text-sm font-medium text-zinc-200">
                                    {formatStatus(audit.event)}
                                </span>
                                <span className="text-sm text-zinc-500">
                                    {formatDate(audit.createdAt)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4 text-sm text-zinc-500">
                        No audit events recorded.
                    </p>
                )}
            </section>
        </main>
    );
}

function TextBlock({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                {label}
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                {displayValue(value)}
            </p>
        </div>
    );
}
