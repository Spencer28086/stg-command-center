import type { LucideIcon } from "lucide-react";
import {
    Activity,
    CheckCircle2,
    Database,
    Info,
    KeyRound,
    Plug,
    RefreshCw,
    ShieldCheck,
    TriangleAlert,
    Wrench,
    XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
    revalidateAgreements,
    revalidateAllCommandCenter,
    revalidateClients,
    revalidateDashboard,
    revalidateRequests,
    revalidateSubscriptions,
    revalidateSupport,
} from "@/server/actions/site-health";
import {
    getSiteHealth,
    type HealthStatus,
} from "@/server/queries/site-health";

export const dynamic = "force-dynamic";

const statusConfig: Record<
    HealthStatus,
    { label: string; className: string; icon: LucideIcon }
> = {
    healthy: {
        label: "Healthy",
        className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
        icon: CheckCircle2,
    },
    warning: {
        label: "Warning",
        className: "border-[#d4af37]/30 bg-[#2a1f0b]/70 text-[#f5d77b]",
        icon: TriangleAlert,
    },
    issue: {
        label: "Issue",
        className: "border-red-400/20 bg-red-400/10 text-red-100",
        icon: XCircle,
    },
};

function StatusBadge({ status }: { status: HealthStatus }) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm ${config.className}`}
        >
            <Icon className="h-4 w-4" />
            {config.label}
        </span>
    );
}

function SummaryCard({
    title,
    detail,
    status,
    icon: Icon,
}: {
    title: string;
    detail: string;
    status: HealthStatus;
    icon: LucideIcon;
}) {
    return (
        <article className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3 text-[#d4af37]">
                    <Icon className="h-5 w-5" />
                </div>
                <StatusBadge status={status} />
            </div>
            <p className="mt-5 text-lg font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">{detail}</p>
        </article>
    );
}

function SectionShell({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3">
                    <Icon className="h-5 w-5 text-[#d4af37]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="mt-1 text-sm text-stone-400">{description}</p>
                </div>
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function CountItem({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {value}
            </p>
        </div>
    );
}

function RepairButton({
    action,
    label,
}: {
    action: () => Promise<void>;
    label: string;
}) {
    return (
        <form action={action}>
            <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-3 text-sm font-medium text-[#f5d77b] transition hover:border-[#d4af37]/45 hover:bg-[#d4af37]/20"
            >
                <RefreshCw className="h-4 w-4" />
                {label}
            </button>
        </form>
    );
}

export default async function HealthPage() {
    const health = await getSiteHealth();

    return (
        <main className="space-y-8">
            <PageHeader
                title="Site Health"
                description="Operational health, diagnostics, and safe repairs for Spencer Technology Group systems."
            />

            {/* Summary cards */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Database"
                    detail="Prisma connection to the STG Neon database."
                    status={health.summary.database}
                    icon={Database}
                />
                <SummaryCard
                    title="Environment"
                    detail="Required configuration presence checks."
                    status={health.summary.environment}
                    icon={KeyRound}
                />
                <SummaryCard
                    title="Providers"
                    detail="Stripe, Resend, and storage configuration."
                    status={health.summary.providers}
                    icon={Plug}
                />
                <SummaryCard
                    title="Open Work"
                    detail="Requests, tickets, and agreements waiting."
                    status={health.summary.openWork}
                    icon={Activity}
                />
            </section>

            {/* Database health */}
            <SectionShell
                title="Database Health"
                description="Read-only connection check and record counts."
                icon={Database}
            >
                <div className="flex flex-wrap items-center gap-4">
                    <StatusBadge
                        status={health.database.connected ? "healthy" : "issue"}
                    />
                    <p className="text-sm text-stone-400">
                        Last checked {health.checkedAt.toLocaleString()}
                        {health.database.serverTime
                            ? ` · DB server time ${health.database.serverTime.toLocaleString()}`
                            : null}
                    </p>
                </div>

                {health.database.counts ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <CountItem
                            label="System Requests"
                            value={health.database.counts.systemRequests}
                        />
                        <CountItem
                            label="Support Tickets"
                            value={health.database.counts.supportTickets}
                        />
                        <CountItem
                            label="Agreements"
                            value={health.database.counts.maintenanceAgreements}
                        />
                        <CountItem
                            label="Subscriptions"
                            value={health.database.counts.subscriptions}
                        />
                    </div>
                ) : null}

                {!health.database.connected && health.database.error ? (
                    <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                        <p className="text-sm font-medium text-red-100">
                            Connection Error
                        </p>
                        <p className="mt-2 break-words text-sm leading-6 text-red-100/75">
                            {health.database.error}
                        </p>
                    </div>
                ) : null}
            </SectionShell>

            {/* Environment health */}
            <SectionShell
                title="Environment Health"
                description="Presence checks only. Values are never displayed."
                icon={KeyRound}
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {health.env.map((entry) => (
                        <div
                            key={entry.name}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                            <div>
                                <p className="break-all font-mono text-sm text-stone-200">
                                    {entry.name}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
                                    {entry.required ? "Required" : "Optional"}
                                </p>
                            </div>
                            {entry.configured ? (
                                <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Configured
                                </span>
                            ) : (
                                <span
                                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs ${
                                        entry.required
                                            ? "border-red-400/20 bg-red-400/10 text-red-100"
                                            : "border-[#d4af37]/25 bg-[#d4af37]/10 text-[#f5d77b]"
                                    }`}
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Missing
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </SectionShell>

            {/* Provider health */}
            <SectionShell
                title="Provider Health"
                description="Configuration presence for external services. No external API calls are made."
                icon={Plug}
            >
                <div className="grid gap-4 sm:grid-cols-3">
                    {health.providers.map((provider) => (
                        <div
                            key={provider.name}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-white">
                                    {provider.name}
                                </p>
                                {provider.configured ? (
                                    <span className="flex items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-100">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Configured
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-2.5 py-1 text-xs text-[#f5d77b]">
                                        <XCircle className="h-3.5 w-3.5" />
                                        Missing
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-stone-500">
                                {provider.detail}
                            </p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            {/* Operational warnings */}
            <SectionShell
                title="Operational Warnings"
                description="Items that may need attention. Informational only — nothing here changes data."
                icon={ShieldCheck}
            >
                {health.warnings.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        No warnings. All systems look clear.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {health.warnings.map((warning) => {
                            const Icon =
                                warning.severity === "warning"
                                    ? TriangleAlert
                                    : Info;

                            return (
                                <div
                                    key={warning.title}
                                    className={`rounded-2xl border p-4 ${
                                        warning.severity === "warning"
                                            ? "border-[#d4af37]/30 bg-[#2a1f0b]/70 text-[#f5d77b]"
                                            : "border-[#d4af37]/20 bg-[#d4af37]/10 text-stone-100"
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {warning.title}
                                            </p>
                                            <p className="mt-1 text-sm leading-6 opacity-75">
                                                {warning.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionShell>

            {/* Data consistency */}
            {health.consistency ? (
                <SectionShell
                    title="Data Consistency"
                    description="How Command Center metrics are sourced. Informational only."
                    icon={Info}
                >
                    <div className="grid gap-4 xl:grid-cols-2">
                        <CountItem
                            label="Signed Agreements"
                            value={health.consistency.signedAgreements}
                        />
                        {health.consistency.notes.map((note) => (
                            <div
                                key={note.label}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                            >
                                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                                    {note.label}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-stone-300">
                                    {note.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </SectionShell>
            ) : null}

            {/* Safe repairs */}
            <SectionShell
                title="Safe Repairs"
                description="These actions only refresh Next.js cached route data. They never modify database records, payments, or subscriptions."
                icon={Wrench}
            >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <RepairButton
                        action={revalidateDashboard}
                        label="Refresh Dashboard Data"
                    />
                    <RepairButton
                        action={revalidateRequests}
                        label="Refresh Requests View"
                    />
                    <RepairButton
                        action={revalidateAgreements}
                        label="Refresh Agreements View"
                    />
                    <RepairButton
                        action={revalidateSupport}
                        label="Refresh Support View"
                    />
                    <RepairButton
                        action={revalidateClients}
                        label="Refresh Clients View"
                    />
                    <RepairButton
                        action={revalidateSubscriptions}
                        label="Refresh Subscriptions View"
                    />
                </div>
                <div className="mt-3">
                    <RepairButton
                        action={revalidateAllCommandCenter}
                        label="Refresh All Command Center Views"
                    />
                </div>
            </SectionShell>
        </main>
    );
}
