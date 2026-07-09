import Link from "next/link";
import { notFound } from "next/navigation";
import { MetaItem } from "@/components/ui/MetaItem";
import { SummaryItem } from "@/components/ui/SummaryItem";
import { displayValue, formatDate, formatMoney, formatStatus } from "@/lib/formatters";
import {
    getAgreementById,
    type AgreementInboxItem,
} from "@/server/queries/agreements";

type AgreementDetailPageProps = {
    params:
    | Promise<{
        id: string;
    }>
    | {
        id: string;
    };
};

export const dynamic = "force-dynamic";

export default async function AgreementDetailPage({
    params,
}: AgreementDetailPageProps) {
    const resolvedParams = await params;
    const agreement = await getAgreementById(resolvedParams.id);

    if (!agreement) {
        notFound();
    }

    const monthlyValue =
        agreement.partnershipRate ?? agreement.monthlyAmount ?? null;

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/agreements"
                            className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                        >
                            ← Back to Agreements
                        </Link>

                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                            Agreement Detail
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                                {displayValue(agreement.clientName)}
                            </h1>

                            <AgreementStatusBadge
                                status={agreement.status}
                                signedAt={agreement.signedAt}
                            />
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Full read-only view of this maintenance agreement record.
                        </p>
                    </div>

                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                        Created {formatDate(agreement.createdAt)}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <AgreementDetailsPanel agreement={agreement} />
                </div>

                <aside className="space-y-4">
                    <SummaryCard agreement={agreement} monthlyValue={monthlyValue} />
                    <ReadOnlyNotice />
                </aside>
            </section>
        </main>
    );
}

function AgreementDetailsPanel({
    agreement,
}: {
    agreement: AgreementInboxItem;
}) {
    const monthlyValue =
        agreement.partnershipRate ?? agreement.monthlyAmount ?? null;

    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">
                Agreement Information
            </h2>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <MetaItem label="Client Name" value={agreement.clientName} />
                <MetaItem label="Business Name" value={agreement.businessName} />
                <MetaItem label="Client Email" value={agreement.clientEmail} />
                <MetaItem label="Status" value={formatStatus(agreement.status)} />
                <MetaItem label="Monthly Rate" value={formatMoney(monthlyValue)} />
                <MetaItem
                    label="Signed Date"
                    value={agreement.signedAt ? formatDate(agreement.signedAt) : "—"}
                />
                <MetaItem label="Created Date" value={formatDate(agreement.createdAt)} />
                <MetaItem label="Agreement ID" value={agreement.id} />
            </dl>

            <div className="mt-5 rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                    Record Notes
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-300">
                    This page is currently a read-only administrative view. The signed
                    agreement is being counted for real client count and monthly recurring
                    revenue calculations, while active subscription tracking remains
                    separate.
                </p>
            </div>
        </section>
    );
}

function SummaryCard({
    agreement,
    monthlyValue,
}: {
    agreement: AgreementInboxItem;
    monthlyValue:
    | AgreementInboxItem["partnershipRate"]
    | AgreementInboxItem["monthlyAmount"]
    | null;
}) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">Summary</h2>

            <div className="mt-5 space-y-4">
                <SummaryItem label="Client" value={agreement.clientName} />
                <SummaryItem label="Business" value={agreement.businessName} />
                <SummaryItem label="Status" value={formatStatus(agreement.status)} />
                <SummaryItem label="Monthly Rate" value={formatMoney(monthlyValue)} />
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
                This detail view does not update agreement status, resend emails,
                generate PDFs, create subscriptions, or modify the database. Those
                actions will be added in later phases.
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
    if (status === "ACTIVE") {
        return (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Active
            </span>
        );
    }

    if (signedAt) {
        return (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                Signed
            </span>
        );
    }

    if (status === "PENDING_SIGNATURE") {
        return (
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                Pending Signature
            </span>
        );
    }

    if (status === "CANCELLED") {
        return (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                Cancelled
            </span>
        );
    }

    return (
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
            {formatStatus(status)}
        </span>
    );
}

