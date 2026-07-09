import Link from "next/link";
import { Bell, RadioTower } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import {
  getNotificationsFeed,
  normalizeNotificationFeedFilter,
  type NotificationFeedFilter,
  type NotificationFeedItem,
} from "@/server/queries/notifications";

type NotificationsPageProps = {
  searchParams?:
  | Promise<{
    filter?: string | string[];
  }>
  | {
    filter?: string | string[];
  };
};

const filterLinks: Array<{
  href: string;
  label: string;
  value: NotificationFeedFilter;
}> = [
  { href: "/notifications", label: "All", value: "all" },
  {
    href: "/notifications?filter=requests",
    label: "Requests",
    value: "requests",
  },
  {
    href: "/notifications?filter=agreements",
    label: "Agreements",
    value: "agreements",
  },
  {
    href: "/notifications?filter=support",
    label: "Support",
    value: "support",
  },
  {
    href: "/notifications?filter=subscriptions",
    label: "Subscriptions",
    value: "subscriptions",
  },
];

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeNotificationFeedFilter(
    resolvedSearchParams?.filter,
  );
  const feed = await getNotificationsFeed(activeFilter);

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Notifications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Read-only operational activity across requests, agreements,
              support, and subscriptions.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
            <span className="font-semibold">{feed.counts.all}</span>{" "}
            active feed item{feed.counts.all === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Requests" value={feed.counts.requests} />
        <SummaryStat label="Agreements" value={feed.counts.agreements} />
        <SummaryStat label="Support" value={feed.counts.support} />
        <SummaryStat label="Subscriptions" value={feed.counts.subscriptions} />
      </section>

      <section className="flex flex-wrap gap-3">
        {filterLinks.map((filter) => (
          <FilterLink
            key={filter.value}
            href={filter.href}
            label={filter.label}
            count={feed.counts[filter.value]}
            active={activeFilter === filter.value}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
        <div className="flex gap-3">
          <RadioTower className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
              Read-Only Feed
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              This page does not mark notifications read, update records, send
              replies, modify subscriptions, or write to the database.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">
              Operational Feed
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Most recent matching items first.
            </p>
          </div>
          <Bell className="h-5 w-5 text-yellow-500/80" />
        </div>

        {feed.items.length > 0 ? (
          <div className="mt-5 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-black/20">
            {feed.items.map((item) => (
              <NotificationRow key={`${item.category}-${item.label}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-zinc-800 bg-black/20 p-8 text-center">
            <h3 className="text-lg font-semibold text-zinc-100">
              No notifications found
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              This filter does not currently have any matching operational
              records.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
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

function NotificationRow({ item }: { item: NotificationFeedItem }) {
  return (
    <Link href={item.href} className="block p-4 transition hover:bg-yellow-500/5">
      <div className="flex gap-4">
        <div
          className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${getToneClassName(item.tone)}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                  {item.label}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 break-words text-sm font-semibold text-zinc-100">
                {item.title}
              </p>
              <p className="mt-1 break-words text-sm leading-6 text-zinc-400">
                {item.detail}
              </p>
            </div>

            <span className="shrink-0 text-xs text-zinc-500">
              {formatDate(item.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getToneClassName(tone: NotificationFeedItem["tone"]) {
  if (tone === "red") {
    return "border-red-400 bg-red-400";
  }

  if (tone === "green") {
    return "border-emerald-400 bg-emerald-400";
  }

  if (tone === "stone") {
    return "border-stone-500 bg-stone-500";
  }

  return "border-yellow-400 bg-yellow-400";
}
