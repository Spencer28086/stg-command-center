import Link from "next/link";
import { notFound } from "next/navigation";
import { MetaItem } from "@/components/ui/MetaItem";
import { SummaryItem } from "@/components/ui/SummaryItem";
import { displayValue, formatDate, formatStatus } from "@/lib/formatters";
import {
    reopenSupportTicket,
    resolveSupportTicket,
    updateSupportTicketPriority,
} from "@/server/actions/support";
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
                            Full administrative view of this support ticket record.
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
                    <TicketActions ticket={ticket} />
                    <SummaryCard ticket={ticket} />
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
                <MetaItem label="Subject" value={ticket.subject} />
                <MetaItem label="Name" value={ticket.name} />
                <MetaItem label="Business Name" value={ticket.businessName} />
                <MetaItem label="Email" value={ticket.email} />
                <MetaItem label="Category" value={ticket.category} />
                <MetaItem label="Status" value={formatStatus(ticket.status)} />
                <MetaItem label="Priority" value={formatStatus(ticket.priority)} />
                <MetaItem label="Created Date" value={formatDate(ticket.createdAt)} />
                <MetaItem label="Updated Date" value={formatDate(ticket.updatedAt)} />
                <MetaItem
                    label="Resolved Date"
                    value={ticket.resolvedAt ? formatDate(ticket.resolvedAt) : "—"}
                />
                <MetaItem label="Ticket ID" value={ticket.id} />
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

function TicketActions({ ticket }: { ticket: SupportInboxItem }) {
    const isResolved =
        ticket.status === "RESOLVED" || ticket.status === "CLOSED" || !!ticket.resolvedAt;
    const statusAction = isResolved
        ? reopenSupportTicket.bind(null, ticket.id)
        : resolveSupportTicket.bind(null, ticket.id);

    return (
        <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">Ticket Actions</h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
                This only changes the internal ticket status. It does not email the
                client, send replies, delete tickets, or modify user accounts.
            </p>

            <form action={statusAction} className="mt-5">
                <button
                    type="submit"
                    className={
                        isResolved
                            ? "w-full rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-yellow-500/30 hover:text-yellow-100"
                            : "w-full rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
                    }
                >
                    {isResolved ? "Reopen Ticket" : "Mark Resolved"}
                </button>
            </form>

            <div className="mt-6 border-t border-zinc-800 pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                    Priority
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["LOW", "NORMAL", "HIGH", "URGENT"] as const).map((priority) => {
                        const priorityAction = updateSupportTicketPriority.bind(
                            null,
                            ticket.id,
                            priority,
                        );

                        return (
                            <form action={priorityAction} key={priority}>
                                <button
                                    type="submit"
                                    className={getPriorityButtonClassName(
                                        priority,
                                        ticket.priority === priority,
                                    )}
                                >
                                    {formatStatus(priority)}
                                </button>
                            </form>
                        );
                    })}
                </div>
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

function getPriorityButtonClassName(priority: string, active: boolean) {
    if (active) {
        if (priority === "HIGH" || priority === "URGENT") {
            return "w-full rounded-full border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200";
        }

        if (priority === "NORMAL") {
            return "w-full rounded-full border border-blue-500/50 bg-blue-500/15 px-3 py-2 text-sm font-semibold text-blue-200";
        }

        return "w-full rounded-full border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100";
    }

    return "w-full rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:border-yellow-500/30 hover:text-yellow-100";
}
