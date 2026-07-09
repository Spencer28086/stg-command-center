import Link from "next/link";
import { MetaItem } from "@/components/ui/MetaItem";
import { displayValue, formatDate, formatStatus } from "@/lib/formatters";
import {
  getSubscriptionsInbox,
  normalizeSubscriptionInboxFilter,
  type SubscriptionInboxItem,
} from "@/server/queries/subscriptions";

type SubscriptionsPageProps = {
  searchParams?:
  | Promise<{
    filter?: string | string[];
  }>
  | {
    filter?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeSubscriptionInboxFilter(
    resolvedSearchParams?.filter,
  );

  const { subscriptions, counts } = await getSubscriptionsInbox(activeFilter);

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Subscriptions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Read-only subscription view. Active subscriptions count only
              active/ACTIVE records; trialing records are displayed separately.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryStat
          label="Active Subscriptions"
          value={String(counts.active)}
        />
        <SummaryStat
          label="Trialing Subscriptions"
          value={String(counts.trialing)}
        />
        <SummaryStat label="All Subscriptions" value={String(counts.all)} />
      </section>

      <section className="flex flex-wrap gap-3">
        <FilterLink
          href="/subscriptions"
          label="All"
          count={counts.all}
          active={activeFilter === "all"}
        />
        <FilterLink
          href="/subscriptions?filter=active"
          label="Active"
          count={counts.active}
          active={activeFilter === "active"}
        />
        <FilterLink
          href="/subscriptions?filter=trialing"
          label="Trialing"
          count={counts.trialing}
          active={activeFilter === "trialing"}
        />
        <FilterLink
          href="/subscriptions?filter=canceled"
          label="Canceled"
          count={counts.canceled}
          active={activeFilter === "canceled"}
        />
      </section>

      <section className="space-y-4">
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
            <h2 className="text-lg font-semibold text-zinc-100">
              No subscriptions found
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This filter does not currently have any matching Subscription
              records.
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

function SubscriptionCard({
  subscription,
}: {
  subscription: SubscriptionInboxItem;
}) {
  const clientName = formatClientName(subscription);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-50">
              {displayValue(clientName)}
            </h2>
            <SubscriptionStatusBadge status={subscription.status} />
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {displayValue(subscription.plan.name)}
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          Created {formatDate(subscription.createdAt)}
        </div>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Customer" value={clientName} />
        <MetaItem label="Email" value={subscription.user.email} />
        <MetaItem label="Status" value={formatStatus(subscription.status)} />
        <MetaItem label="Plan" value={subscription.plan.name} />
        <MetaItem label="Price" value={subscription.plan.displayPrice} />
        <MetaItem label="Created Date" value={formatDate(subscription.createdAt)} />
        <MetaItem label="Updated Date" value={formatDate(subscription.updatedAt)} />
        <MetaItem
          label="Stripe Customer"
          value={subscription.stripeCustomerId}
        />
      </dl>
    </article>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  if (status === "active" || status === "ACTIVE") {
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Active
      </span>
    );
  }

  if (status === "trialing" || status === "TRIALING") {
    return (
      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
        Trialing
      </span>
    );
  }

  if (
    status === "canceled" ||
    status === "CANCELED" ||
    status === "cancelled" ||
    status === "CANCELLED"
  ) {
    return (
      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
        Canceled
      </span>
    );
  }

  return (
    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300">
      {formatStatus(status)}
    </span>
  );
}

function formatClientName(subscription: SubscriptionInboxItem) {
  if (subscription.user.businessName) {
    return subscription.user.businessName;
  }

  const personalName = [
    subscription.user.firstName,
    subscription.user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return personalName || subscription.stripeCustomerId || subscription.user.email;
}
