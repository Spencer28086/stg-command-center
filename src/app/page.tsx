import {
  AlertTriangle,
  ClipboardList,
  FileSignature,
  Headphones,
  RadioTower,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertList } from "@/components/dashboard/AlertList";
import { getDashboardSummary } from "@/server/queries/dashboard-summary";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

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
    title: "Next phase",
    description:
      "After confirming the dashboard numbers, the next module should be the Requests Inbox.",
    severity: "warning" as const,
  },
];

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

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
      value: formatCurrency(summary.monthlyRecurringRevenue),
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

        <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f5d77b] shadow-[0_0_40px_rgba(212,175,55,0.08)]">
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4" />
            <span>Live database read enabled</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3">
              <AlertTriangle className="h-5 w-5 text-[#f5d77b]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Action Items
              </h2>
              <p className="text-sm text-stone-400">
                This will become the live review queue for the business.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-[#d4af37]/15 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-stone-400">
              Requests, unsigned agreements, failed payments, and support
              tickets will appear here once the notification layer is added.
            </p>
          </div>
        </div>

        <AlertList alerts={alerts} />
      </section>
    </main>
  );
}