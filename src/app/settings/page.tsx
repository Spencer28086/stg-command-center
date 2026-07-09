import { Activity } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { DatabaseStatusCard } from "@/components/settings/DatabaseStatusCard";
import { MetaItem } from "@/components/ui/MetaItem";

export default function SettingsPage() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage API connection settings, notification preferences, private app behavior, and future desktop options."
        action={
          <Link
            href="/health"
            className="flex items-center gap-2 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-3 text-sm font-medium text-[#f5d77b] transition hover:border-[#d4af37]/45 hover:bg-[#d4af37]/20"
          >
            <Activity className="h-4 w-4" />
            Open Site Health
          </Link>
        }
      />

      <DatabaseStatusCard />

      <section className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Operating Mode</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            STG Command Center is currently running as a private read-only admin
            surface. Records can be inspected and linked across modules, but the
            app does not update statuses, send emails, generate PDFs, modify
            subscriptions, or write operational records.
          </p>

          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <MetaItem label="Access" value="Basic Auth protected" />
            <MetaItem label="Mutation Mode" value="Disabled" />
            <MetaItem label="Client Source" value="Signed agreements" />
            <MetaItem label="ClientAccount Records" value="Excluded from client count" />
          </dl>
        </section>

        <section className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Data Rules</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-stone-300">
            <p>
              Real clients are based on signed maintenance agreements, not
              ClientAccount records.
            </p>
            <p>
              Monthly recurring revenue includes signed agreement monthly rates
              plus active subscription plan pricing.
            </p>
            <p>
              Active subscriptions only include active/ACTIVE statuses. Trialing
              subscriptions are displayed separately.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
