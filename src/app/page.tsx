import {
  AlertTriangle,
  Bell,
  ClipboardList,
  FileSignature,
  Headphones,
  Inbox,
  RadioTower,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertList } from "@/components/dashboard/AlertList";
import {
  getDashboardActionQueue,
  type DashboardActionQueueItem,
} from "@/server/queries/dashboard-action-queue";
import { getDashboardSummary } from "@/server/queries/dashboard-summary";
import { formatMoney, formatShortDate } from "@/lib/formatters";

const alerts = [
  {
    title: "Database connection active",
    description:
      "STG Command Center is now reading summary data from the connected STG database.",
    severity: "success" as const,
  },
  {
    title: "Read-only mode",
    description:
      "Dashboard data is being read safely. No create, update, or delete actions are enabled yet.",
    severity: "info" as const,
  },
  {
    title: "Action queue online",
    description:
      "Dashboard follow-up items now link into the read-only request, agreement, support, and subscription views.",
    severity: "warning" as const,
  },
];

export default async function DashboardPage() {
  const [summary, actionQueue] = await Promise.all([
    getDashboardSummary(),
    getDashboardActionQueue(),
  ]);

  const dashboardStats = [
    {
      title: "New Requests",
      value: String(summary.newRequests),
      detail: "Quote, system, and consultation requests",
      icon: ClipboardList,
    },
    {
      title: "Pending Agreements",
      value: String(summary.pendingAgreements),
      detail: "Awaiting client acceptance",
      icon: FileSignature,
    },
    {
      title: "Open Support",
      value: String(summary.openSupport),
      detail: "Active client support issues",
      icon: Headphones,
    },
    {
      title: "Active Subscriptions",
      value: String(summary.activeSubscriptions),
      detail: "Partnerships, care plans, and software",
      icon: WalletCards,
    },
    {
      title: "Monthly Recurring Revenue",
      value: formatMoney(summary.monthlyRecurringRevenue),
      detail: "Partnerships plus active subscription plans",
      icon: TrendingUp,
    },
    {
      title: "Clients",
      value: String(summary.clients),
      detail: "Active STG client accounts",
      icon: Users,
    },
  ];

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-[#d4af37]">
            Spencer Technology Group
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Command Center
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-400 md:text-base">
            Private operations dashboard for managing clients, requests,
            subscriptions, agreements, support activity, revenue, and alerts.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
          <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f5d77b] shadow-[0_0_40px_rgba(212,175,55,0.08)]">
            <div className="flex items-center gap-2">
              <RadioTower className="h-4 w-4" />
              <span>Live database read enabled</span>
            </div>
          </div>

          <Link
            href="/notifications"
            className="rounded-2xl border border-stone-800 bg-black/40 px-4 py-3 text-sm font-semibold text-stone-200 transition hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10 hover:text-[#f5d77b]"
          >
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#d4af37]" />
              Notifications feed
            </span>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3">
              <AlertTriangle className="h-5 w-5 text-[#f5d77b]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Action Items
              </h2>
              <p className="text-sm text-stone-400">
                Read-only operational queue for today&apos;s follow-up work.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <ActionQueueSection
              title="New Requests"
              empty="No new requests need contact."
              items={actionQueue.newRequests}
              href="/notifications?filter=requests"
            />
            <ActionQueueSection
              title="Pending Agreements"
              empty="No maintenance agreements are awaiting signature."
              items={actionQueue.pendingAgreements}
              href="/notifications?filter=agreements"
            />
            <ActionQueueSection
              title="Support Watch"
              empty="No open or high-priority support tickets."
              items={actionQueue.openSupport}
              href="/notifications?filter=support"
            />
            <ActionQueueSection
              title="Trialing Subscriptions"
              empty="No trialing subscriptions are currently active."
              items={actionQueue.trialingSubscriptions}
              href="/notifications?filter=subscriptions"
            />
            <ActionQueueSection
              title="Recently Signed"
              empty="No signed agreements are available yet."
              items={actionQueue.recentlySigned}
              href="/notifications?filter=agreements"
            />
          </div>
        </section>

        <AlertList alerts={alerts} />
      </section>
    </main>
  );
}

function ActionQueueSection({
  title,
  empty,
  items,
  href,
}: {
  title: string;
  empty: string;
  items: DashboardActionQueueItem[];
  href: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4af37]/80">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-2.5 py-1 text-xs font-semibold text-[#f5d77b]">
            {items.length}
          </span>
          <Link
            href={href}
            className="text-xs font-semibold text-stone-500 transition hover:text-[#f5d77b]"
          >
            View all
          </Link>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <ActionQueueRow key={`${title}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-[#d4af37]/15 bg-white/[0.02] px-4 py-3">
          <p className="text-sm text-stone-500">{empty}</p>
        </div>
      )}
    </section>
  );
}

function ActionQueueRow({ item }: { item: DashboardActionQueueItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-start gap-3 rounded-2xl border border-stone-800 bg-black/25 p-4 transition hover:border-[#d4af37]/35 hover:bg-[#0d0b07]/80"
    >
      <div
        className={`mt-0.5 rounded-xl border p-2 ${getQueueToneClassName(item.tone)}`}
      >
        <Inbox className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words text-sm font-semibold text-stone-100">
            {item.title}
          </p>
          <span className="shrink-0 text-xs text-stone-500">
            {formatShortDate(item.createdAt)}
          </span>
        </div>
        <p className="mt-1 break-words text-sm leading-6 text-stone-400">
          {item.detail}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]/80 transition group-hover:text-[#f5d77b]">
          {item.label}
        </p>
      </div>
    </Link>
  );
}

function getQueueToneClassName(tone: DashboardActionQueueItem["tone"]) {
  if (tone === "red") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (tone === "green") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (tone === "stone") {
    return "border-stone-700 bg-stone-900 text-stone-300";
  }

  return "border-[#d4af37]/25 bg-[#d4af37]/10 text-[#f5d77b]";
}
