import Link from "next/link";
import {
  getClientsFromSignedAgreements,
  normalizeClientAgreementFilter,
  type ClientAgreementItem,
  type ClientMoneyValue,
} from "@/server/queries/clients";

type ClientsPageProps = {
  searchParams?:
  | Promise<{
    filter?: string | string[];
  }>
  | {
    filter?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeClientAgreementFilter(
    resolvedSearchParams?.filter,
  );

  const { clients, counts, monthlyRevenue } =
    await getClientsFromSignedAgreements(activeFilter);

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Clients
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Read-only client view based on signed maintenance agreements.
              ClientAccount records are intentionally excluded for now.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <SummaryStat label="Real Clients" value={String(counts.all)} />
        <SummaryStat
          label="Monthly Revenue from Signed Agreements"
          value={formatMoney(monthlyRevenue)}
        />
      </section>

      <section className="flex flex-wrap gap-3">
        <FilterLink
          href="/clients"
          label="All"
          count={counts.all}
          active={activeFilter === "all"}
        />
        <FilterLink
          href="/clients?filter=signed"
          label="Signed"
          count={counts.signed}
          active={activeFilter === "signed"}
        />
        <FilterLink
          href="/clients?filter=active"
          label="Active"
          count={counts.active}
          active={activeFilter === "active"}
        />
      </section>

      <section className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
          Client Count Source
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          Client count is currently based on signed maintenance agreements.
          ClientAccount records are not used as real clients yet because
          generated/test/CAP records exist.
        </p>
      </section>

      <section className="space-y-4">
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientAgreementCard key={client.id} client={client} />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-100">
              No clients found
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This filter does not currently have any signed maintenance
              agreement records.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-zinc-50">{value}</p>
    </div>
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

function ClientAgreementCard({ client }: { client: ClientAgreementItem }) {
  const monthlyValue = client.partnershipRate ?? client.monthlyAmount ?? null;

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-50">
              {displayValue(client.clientName)}
            </h2>
            <AgreementStatusBadge
              status={client.status}
              signedAt={client.signedAt}
            />
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {displayValue(client.businessName)}
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          Created {formatDate(client.createdAt)}
        </div>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Client Name" value={client.clientName} />
        <MetaItem label="Business Name" value={client.businessName} />
        <MetaItem label="Client Email" value={client.clientEmail} />
        <MetaItem label="Agreement Status" value={formatStatus(client.status)} />
        <MetaItem label="Monthly Rate" value={formatMoney(monthlyValue)} />
        <MetaItem
          label="Signed Date"
          value={client.signedAt ? formatDate(client.signedAt) : "—"}
        />
        <MetaItem label="Created Date" value={formatDate(client.createdAt)} />
      </dl>

      <div className="mt-5 flex justify-end">
        <Link
          href={`/clients/${client.id}`}
          className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
        >
          View client
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

function displayValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "—";
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatMoney(value: ClientMoneyValue) {
  if (value === null || value === undefined) {
    return "—";
  }

  const amount =
    typeof value === "number" ? value : Number(value.toString());

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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
