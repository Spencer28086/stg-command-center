import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getSupportTicketById,
    type SupportInboxItem,
} from "@/server/queries/support";

type SupportTicketDetailPageProps = {
    params:
    | Promise<{
        id: string;
    }>
    | {
        id: string;
    };
};

export const dynamic = "force-dynamic";

export default async function SupportTicketDetailPage({
    params,
}: SupportTicketDetailPageProps) {
    const resolvedParams = await params;
    const ticket = await getSupportTicketById(resolvedParams.id);

    if (!ticket) {
        notFound();
    }

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/support"
                            className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                        >
                            ← Back to Support
                        </Link>

                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                            Support Ticket Detail
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                                {displayValue(ticket.subject)}
                            </h1>

                            <StatusBadge status={ticket.status} resolvedAt={ticket.resolvedAt} />
                            <PriorityBadge priority={ticket.priority} />
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Full read-only view of this support ticket record.
                        </p>
                    </div>

                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                        Created {formatDate(ticket.createdAt)}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <SupportTicketDetailsPanel ticket={ticket} />
                </div>

                <aside className="space-y-4">
                    <SummaryCard ticket={ticket} />
                    <ReadOnlyNotice />
                </aside>
            </section>
        </main>
    );
}

function SupportTicketDetailsPanel({ ticket }: { ticket: SupportInboxItem }) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">
                Ticket Information
            </h2>

            <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailField label="Subject" value={ticket.subject} />
                <DetailField label="Name" value={ticket.name} />
                <DetailField label="Business Name" value={ticket.businessName} />
                <DetailField label="Email" value={ticket.email} />
                <DetailField label="Category" value={ticket.category} />
                <DetailField label="Status" value={formatStatus(ticket.status)} />
                <DetailField label="Priority" value={formatStatus(ticket.priority)} />
                <DetailField label="Created Date" value={formatDate(ticket.createdAt)} />
                <DetailField label="Updated Date" value={formatDate(ticket.updatedAt)} />
                <DetailField
                    label="Resolved Date"
                    value={ticket.resolvedAt ? formatDate(ticket.resolvedAt) : "—"}
                />
                <DetailField label="Ticket ID" value={ticket.id} />
            </dl>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                    Message
                </h3>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {displayValue(ticket.message)}
                </p>
            </div>
        </section>
    );
}

function SummaryCard({ ticket }: { ticket: SupportInboxItem }) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">Summary</h2>

            <div className="mt-5 space-y-4">
                <SummaryItem label="Requester" value={ticket.name} />
                <SummaryItem label="Business" value={ticket.businessName} />
                <SummaryItem label="Status" value={formatStatus(ticket.status)} />
                <SummaryItem label="Priority" value={formatStatus(ticket.priority)} />
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
                This detail view does not update ticket status, send replies, change
                priority, resolve tickets, or modify the database. Those actions will be
                added in a later phase.
            </p>
        </section>
    );
}

function DetailField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </dt>
            <dd className="mt-2 break-words text-sm text-zinc-200">
                {displayValue(value)}
            </dd>
        </div>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </p>
            <p className="mt-1 break-words text-sm text-zinc-200">
                {displayValue(value)}
            </p>
        </div>
    );
}

function StatusBadge({
    status,
    resolvedAt,
}: {
    status: string;
    resolvedAt: Date | null;
}) {
    if (status === "OPEN" && !resolvedAt) {
        return (
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                Open
            </span>
        );
    }

    if (status === "RESOLVED" || status === "CLOSED" || resolvedAt) {
        return (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Resolved
            </span>
        );
    }

    return (
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
            {formatStatus(status)}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    if (priority === "HIGH" || priority === "URGENT") {
        return (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                {formatStatus(priority)}
            </span>
        );
    }

    if (priority === "NORMAL") {
        return (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                Normal
            </span>
        );
    }

    return (
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
            {formatStatus(priority)}
        </span>
    );
}

function displayValue(value: string | null | undefined) {
    return value && value.trim().length > 0 ? value : "—";
}

function formatStatus(status: string) {
    return status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}
