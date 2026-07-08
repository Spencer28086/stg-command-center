import Link from "next/link";
import {
  getRequestsInbox,
  normalizeRequestInboxFilter,
  type RequestInboxFilter,
  type RequestInboxItem,
} from "@/server/queries/requests";

type RequestsPageProps = {
  searchParams?:
  | Promise<{
    status?: string | string[];
  }>
  | {
    status?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeRequestInboxFilter(resolvedSearchParams?.status);
  const { requests, counts } = await getRequestsInbox(activeFilter);

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Requests Inbox
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Read-only view of incoming quote and system requests from the STG
              website. Write actions will be added in a later phase.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
            <span className="font-semibold">{counts.all}</span>{" "}
            total request{counts.all === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <FilterLink
          href="/requests"
          label="All"
          count={counts.all}
          active={activeFilter === "all"}
        />
        <FilterLink
          href="/requests?status=new"
          label="New"
          count={counts.new}
          active={activeFilter === "new"}
        />
        <FilterLink
          href="/requests?status=contacted"
          label="Contacted"
          count={counts.contacted}
          active={activeFilter === "contacted"}
        />
      </section>

      <section className="space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-100">
              No requests found
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This filter does not currently have any matching SystemRequest
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

function RequestCard({ request }: { request: RequestInboxItem }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-50">
              {displayValue(request.name)}
            </h2>

            <ContactedBadge contacted={request.contacted} />
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {displayValue(request.business)}
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          {formatDate(request.createdAt)}
        </div>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Email" value={request.email} />
        <MetaItem label="Type" value={request.type} />
        <MetaItem label="Referral Code" value={request.referralCode} />
        <MetaItem label="Budget" value={request.budget} />
      </dl>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
          Details
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {displayValue(request.details)}
        </p>
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

function displayValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "—";
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