import Link from "next/link";
import {
  getSupportInbox,
  normalizeSupportInboxFilter,
  type SupportInboxItem,
} from "@/server/queries/support";

type SupportPageProps = {
  searchParams?:
  | Promise<{
    filter?: string | string[];
  }>
  | {
    filter?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeSupportInboxFilter(
    resolvedSearchParams?.filter,
  );

  const { tickets, counts } = await getSupportInbox(activeFilter);

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Support Tickets
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Read-only view of client support tickets submitted through the STG
              website. Ticket management actions will be added in a later phase.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
            <span className="font-semibold">{counts.open}</span>{" "}
            open ticket{counts.open === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <FilterLink
          href="/support"
          label="All"
          count={counts.all}
          active={activeFilter === "all"}
        />
        <FilterLink
          href="/support?filter=open"
          label="Open"
          count={counts.open}
          active={activeFilter === "open"}
        />
        <FilterLink
          href="/support?filter=resolved"
          label="Resolved"
          count={counts.resolved}
          active={activeFilter === "resolved"}
        />
        <FilterLink
          href="/support?filter=high"
          label="High Priority"
          count={counts.high}
          active={activeFilter === "high"}
        />
        <FilterLink
          href="/support?filter=normal"
          label="Normal Priority"
          count={counts.normal}
          active={activeFilter === "normal"}
        />
      </section>

      <section className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <SupportTicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-100">
              No support tickets found
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This filter does not currently have any matching SupportTicket
              records.
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

function SupportTicketCard({ ticket }: { ticket: SupportInboxItem }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-50">
              {displayValue(ticket.subject)}
            </h2>

            <StatusBadge status={ticket.status} resolvedAt={ticket.resolvedAt} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {displayValue(ticket.name)} · {displayValue(ticket.businessName)}
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          Created {formatDate(ticket.createdAt)}
        </div>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Name" value={ticket.name} />
        <MetaItem label="Business" value={ticket.businessName} />
        <MetaItem label="Email" value={ticket.email} />
        <MetaItem label="Category" value={ticket.category} />
        <MetaItem label="Status" value={formatStatus(ticket.status)} />
        <MetaItem label="Priority" value={formatStatus(ticket.priority)} />
        <MetaItem
          label="Resolved Date"
          value={ticket.resolvedAt ? formatDate(ticket.resolvedAt) : "—"}
        />
        <MetaItem label="Updated Date" value={formatDate(ticket.updatedAt)} />
      </dl>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
          Message
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {displayValue(ticket.message)}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
          Read-Only Support Record
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          This card reflects the current support ticket record. Status updates,
          replies, priority changes, and resolution actions will be added in a
          later phase.
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href={`/support/${ticket.id}`}
          className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
        >
          View ticket
        </Link>
      </div>
    </article>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
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
