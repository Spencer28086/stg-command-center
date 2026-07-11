import Link from "next/link";
import { MetaItem } from "@/components/ui/MetaItem";
import { displayValue, formatDate, formatMoney, formatStatus } from "@/lib/formatters";
import {
  getAgreementsInbox,
  normalizeAgreementInboxFilter,
  type AgreementInboxItem,
} from "@/server/queries/agreements";

type AgreementsPageProps = {
  searchParams?:
  | Promise<{
    status?: string | string[];
  }>
  | {
    status?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function AgreementsPage({
  searchParams,
}: AgreementsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeAgreementInboxFilter(
    resolvedSearchParams?.status,
  );

  const { agreements, counts } = await getAgreementsInbox(activeFilter);

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Agreements Inbox
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              STG maintenance and partnership agreements. New agreements are
              created here and sent through the website for client signing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/agreements/create"
              className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
            >
              + Create Agreement
            </Link>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
              <span className="font-semibold">{counts.all}</span>{" "}
              total agreement{counts.all === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <FilterLink
          href="/agreements"
          label="All"
          count={counts.all}
          active={activeFilter === "all"}
        />
        <FilterLink
          href="/agreements?status=pending"
          label="Pending"
          count={counts.pending}
          active={activeFilter === "pending"}
        />
        <FilterLink
          href="/agreements?status=signed"
          label="Signed"
          count={counts.signed}
          active={activeFilter === "signed"}
        />
        <FilterLink
          href="/agreements?status=active"
          label="Active"
          count={counts.active}
          active={activeFilter === "active"}
        />
        <FilterLink
          href="/agreements?status=cancelled"
          label="Cancelled"
          count={counts.cancelled}
          active={activeFilter === "cancelled"}
        />
      </section>

      <section className="space-y-4">
        {agreements.length > 0 ? (
          agreements.map((agreement) => (
            <AgreementCard key={agreement.id} agreement={agreement} />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-100">
              No agreements found
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This filter does not currently have any matching
              MaintenanceAgreement records.
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

function AgreementCard({
  agreement,
}: {
  agreement: AgreementInboxItem;
}) {
  const monthlyValue =
    agreement.partnershipRate ?? agreement.monthlyAmount ?? null;

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-50">
              {displayValue(agreement.clientName)}
            </h2>

            <AgreementStatusBadge
              status={agreement.status}
              signedAt={agreement.signedAt}
            />
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {displayValue(agreement.businessName)}
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          Created {formatDate(agreement.createdAt)}
        </div>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Email" value={agreement.clientEmail} />
        <MetaItem label="Status" value={formatStatus(agreement.status)} />
        <MetaItem label="Monthly Rate" value={formatMoney(monthlyValue)} />
        <MetaItem
          label="Signed Date"
          value={agreement.signedAt ? formatDate(agreement.signedAt) : "—"}
        />
      </dl>

      <div className="mt-5 rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
          Read-Only Agreement Record
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          This card reflects the current maintenance agreement record. Management
          actions will be added in a later phase.
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href={`/agreements/${agreement.id}`}
          className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
        >
          View agreement
        </Link>
      </div>
    </article>
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
