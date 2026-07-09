import Link from "next/link";
import { notFound } from "next/navigation";
import { MetaItem } from "@/components/ui/MetaItem";
import { SummaryItem } from "@/components/ui/SummaryItem";
import { displayValue, formatDate, formatMoney, formatStatus } from "@/lib/formatters";
import {
    getClientProfileByAgreementId,
    type ClientAgreementItem,
    type ClientMoneyValue,
    type RelatedClientRequest,
    type RelatedClientSubscription,
    type RelatedClientSupportTicket,
} from "@/server/queries/clients";

type ClientDetailPageProps = {
    params:
    | Promise<{
        id: string;
    }>
    | {
        id: string;
    };
};

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
    params,
}: ClientDetailPageProps) {
    const resolvedParams = await params;
    const profile = await getClientProfileByAgreementId(resolvedParams.id);

    if (!profile) {
        notFound();
    }

    const monthlyValue =
        profile.agreement.partnershipRate ?? profile.agreement.monthlyAmount ?? null;

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/clients"
                            className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                        >
                            ← Back to Clients
                        </Link>

                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                            Client Profile
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                                {displayValue(profile.agreement.clientName)}
                            </h1>
                            <AgreementStatusBadge
                                status={profile.agreement.status}
                                signedAt={profile.agreement.signedAt}
                            />
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Read-only relationship view based on this signed maintenance
                            agreement.
                        </p>
                    </div>

                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                        Monthly Rate {formatMoney(monthlyValue)}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                    <ClientAgreementPanel agreement={profile.agreement} />
                    <RelatedRequestsPanel requests={profile.requests} />
                    <RelatedSupportPanel tickets={profile.supportTickets} />
                    <RelatedSubscriptionsPanel subscriptions={profile.subscriptions} />
                </div>

                <aside className="space-y-4">
                    <SummaryCard
                        agreement={profile.agreement}
                        monthlyValue={monthlyValue}
                        requestCount={profile.requests.length}
                        supportCount={profile.supportTickets.length}
                        subscriptionCount={profile.subscriptions.length}
                    />
                    <ReadOnlyNotice />
                </aside>
            </section>
        </main>
    );
}

function ClientAgreementPanel({
    agreement,
}: {
    agreement: ClientAgreementItem;
}) {
    const monthlyValue = agreement.partnershipRate ?? agreement.monthlyAmount ?? null;

    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-50">
                        Client Information
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Source of truth: signed maintenance agreement.
                    </p>
                </div>

                <Link
                    href={`/agreements/${agreement.id}`}
                    className="w-fit rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                >
                    View agreement
                </Link>
            </div>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <MetaItem label="Client Name" value={agreement.clientName} />
                <MetaItem label="Business Name" value={agreement.businessName} />
                <MetaItem label="Client Email" value={agreement.clientEmail} />
                <MetaItem label="Agreement Status" value={formatStatus(agreement.status)} />
                <MetaItem label="Monthly Rate" value={formatMoney(monthlyValue)} />
                <MetaItem
                    label="Signed Date"
                    value={agreement.signedAt ? formatDate(agreement.signedAt) : "—"}
                />
                <MetaItem label="Created Date" value={formatDate(agreement.createdAt)} />
                <MetaItem label="Agreement ID" value={agreement.id} />
            </dl>
        </section>
    );
}

function RelatedRequestsPanel({
    requests,
}: {
    requests: RelatedClientRequest[];
}) {
    return (
        <RelatedPanel
            title="Related Requests"
            empty="No SystemRequest records match this client email."
        >
            {requests.map((request) => (
                <RelatedLink
                    key={request.id}
                    href={`/requests/${request.id}`}
                    title={request.type}
                    detail={`${displayValue(request.business, request.name)} · ${request.contacted ? "Contacted" : "New"}`}
                    date={request.createdAt}
                />
            ))}
        </RelatedPanel>
    );
}

function RelatedSupportPanel({
    tickets,
}: {
    tickets: RelatedClientSupportTicket[];
}) {
    return (
        <RelatedPanel
            title="Related Support Tickets"
            empty="No SupportTicket records match this client email."
        >
            {tickets.map((ticket) => (
                <RelatedLink
                    key={ticket.id}
                    href={`/support/${ticket.id}`}
                    title={ticket.subject}
                    detail={`${ticket.category} · ${formatStatus(ticket.status)} · ${formatStatus(ticket.priority)}`}
                    date={ticket.createdAt}
                />
            ))}
        </RelatedPanel>
    );
}

function RelatedSubscriptionsPanel({
    subscriptions,
}: {
    subscriptions: RelatedClientSubscription[];
}) {
    return (
        <RelatedPanel
            title="Related Subscriptions"
            empty="No Subscription records match this client email."
        >
            {subscriptions.map((subscription) => (
                <RelatedLink
                    key={subscription.id}
                    href="/subscriptions"
                    title={subscription.plan.name}
                    detail={`${formatStatus(subscription.status)} · ${displayValue(subscription.plan.displayPrice)}`}
                    date={subscription.createdAt}
                />
            ))}
        </RelatedPanel>
    );
}

function RelatedPanel({
    title,
    empty,
    children,
}: {
    title: string;
    empty: string;
    children: React.ReactNode;
}) {
    const hasChildren = Array.isArray(children)
        ? children.length > 0
        : Boolean(children);

    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>

            {hasChildren ? (
                <div className="mt-4 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-black/20">
                    {children}
                </div>
            ) : (
                <p className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-black/20 p-4 text-sm text-zinc-500">
                    {empty}
                </p>
            )}
        </section>
    );
}

function RelatedLink({
    href,
    title,
    detail,
    date,
}: {
    href: string;
    title: string;
    detail: string;
    date: Date;
}) {
    return (
        <Link href={href} className="block p-4 transition hover:bg-yellow-500/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-zinc-100">
                        {displayValue(title)}
                    </p>
                    <p className="mt-1 break-words text-sm leading-6 text-zinc-400">
                        {detail}
                    </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">
                    {formatDate(date)}
                </span>
            </div>
        </Link>
    );
}

function SummaryCard({
    agreement,
    monthlyValue,
    requestCount,
    supportCount,
    subscriptionCount,
}: {
    agreement: ClientAgreementItem;
    monthlyValue: ClientMoneyValue;
    requestCount: number;
    supportCount: number;
    subscriptionCount: number;
}) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">Summary</h2>

            <div className="mt-5 space-y-4">
                <SummaryItem label="Client" value={agreement.clientName} />
                <SummaryItem label="Business" value={agreement.businessName} />
                <SummaryItem label="Email" value={agreement.clientEmail} />
                <SummaryItem label="Monthly Rate" value={formatMoney(monthlyValue)} />
                <SummaryItem label="Requests" value={String(requestCount)} />
                <SummaryItem label="Support Tickets" value={String(supportCount)} />
                <SummaryItem label="Subscriptions" value={String(subscriptionCount)} />
            </div>
        </section>
    );
}

function ReadOnlyNotice() {
    return (
        <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
                Read-Only Phase
            </h2>

            <p className="mt-3 text-sm leading-6 text-yellow-100/80">
                Client profiles are currently based on signed maintenance agreements.
                ClientAccount records are not used as real clients yet. This view does
                not update agreements, requests, support tickets, subscriptions, or the
                database.
            </p>
        </section>
    );
}

function AgreementStatusBadge({
    status,
    signedAt,
}: {
    status: string;
    signedAt: Date | null;
}) {
    if (status === "ACTIVE" || status === "active") {
        return (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Active
            </span>
        );
    }

    if (signedAt || status === "SIGNED" || status === "signed") {
        return (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                Signed
            </span>
        );
    }

    return (
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
            {formatStatus(status)}
        </span>
    );
}
