import Link from "next/link";
import { QuoteStageBadge } from "@/components/quotes/QuoteStageBadge";
import { MetaItem } from "@/components/ui/MetaItem";
import { displayValue, formatDate, formatMoney } from "@/lib/formatters";
import {
    getQuotes,
    normalizeQuoteFilter,
    type QuoteListItem,
} from "@/server/queries/quotes";

type QuotesPageProps = {
    searchParams?:
        | Promise<{
              status?: string | string[];
          }>
        | {
              status?: string | string[];
          };
};

export const dynamic = "force-dynamic";

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
    const resolvedSearchParams = await searchParams;
    const activeFilter = normalizeQuoteFilter(resolvedSearchParams?.status);
    const { quotes, counts } = await getQuotes(activeFilter);

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                    Spencer Technology Group
                </p>

                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                            Project Quotes
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            The pre-agreement sales pipeline. Quotes are created
                            and emailed from the STG website admin; this view
                            tracks their lifecycle and internal notes.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/quotes/create"
                            className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
                        >
                            + Create Quote
                        </Link>
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                            <span className="font-semibold">{counts.all}</span>{" "}
                            total quote{counts.all === 1 ? "" : "s"}
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex flex-wrap gap-3">
                <FilterLink
                    href="/quotes"
                    label="All"
                    count={counts.all}
                    active={activeFilter === "all"}
                />
                <FilterLink
                    href="/quotes?status=draft"
                    label="Drafts"
                    count={counts.draft}
                    active={activeFilter === "draft"}
                />
                <FilterLink
                    href="/quotes?status=sent"
                    label="Sent"
                    count={counts.sent}
                    active={activeFilter === "sent"}
                />
                <FilterLink
                    href="/quotes?status=accepted"
                    label="Accepted"
                    count={counts.accepted}
                    active={activeFilter === "accepted"}
                />
                <FilterLink
                    href="/quotes?status=failed"
                    label="Failed"
                    count={counts.failed}
                    active={activeFilter === "failed"}
                />
            </section>

            <section className="space-y-4">
                {quotes.length > 0 ? (
                    quotes.map((quote) => (
                        <QuoteCard key={quote.id} quote={quote} />
                    ))
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                        <h2 className="text-lg font-semibold text-zinc-100">
                            No quotes found
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            This filter does not currently have any matching
                            quote records.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

function FilterLink({
    href,
    label,
    count,
    active,
}: {
    href: string;
    label: string;
    count: number;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            className={
                active
                    ? "rounded-full border border-yellow-500/50 bg-yellow-500/15 px-4 py-2 text-sm font-semibold text-yellow-100 shadow-sm shadow-yellow-950/40"
                    : "rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-yellow-500/30 hover:text-yellow-100"
            }
        >
            {label}
            <span className="ml-2 rounded-full bg-black/30 px-2 py-0.5 text-xs">
                {count}
            </span>
        </Link>
    );
}

function QuoteCard({ quote }: { quote: QuoteListItem }) {
    return (
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-zinc-50">
                            {displayValue(quote.projectName)}
                        </h2>

                        <QuoteStageBadge stage={quote.stage} />
                    </div>

                    <p className="mt-1 text-sm text-zinc-400">
                        {displayValue(quote.clientName)}
                        {quote.businessName ? ` · ${quote.businessName}` : ""}
                        {" · "}
                        <span className="font-mono text-xs text-zinc-500">
                            {quote.quoteNumber}
                        </span>
                    </p>
                </div>

                <div className="text-sm text-zinc-500">
                    {formatDate(quote.createdAt)}
                </div>
            </div>

            <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetaItem
                    label="Total Cost"
                    value={formatMoney(quote.totalProjectCost)}
                />
                <MetaItem
                    label="Deposit"
                    value={formatMoney(quote.depositAmount)}
                />
                <MetaItem
                    label="Build Tier"
                    value={quote.selectedBuildTier}
                />
                <MetaItem
                    label="Care Plan"
                    value={
                        quote.carePlanTier
                            ? `${quote.carePlanTier}${
                                  quote.carePlanMonthly
                                      ? ` (${formatMoney(quote.carePlanMonthly)}/mo)`
                                      : ""
                              }`
                            : null
                    }
                />
            </dl>

            <div className="mt-5 flex justify-end">
                <Link
                    href={`/quotes/${quote.id}`}
                    className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                >
                    View quote
                </Link>
            </div>
        </article>
    );
}
