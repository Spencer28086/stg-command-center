import { ExternalLink, Package, Power, PowerOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { displayValue, formatShortDate } from "@/lib/formatters";
import {
    activateAppDownload,
    deactivateAppDownload,
} from "@/server/actions/apps";
import { getAppDownloads, type AppDownloadItem } from "@/server/queries/apps";

export const dynamic = "force-dynamic";

export default async function AppsPage() {
    const { apps, counts } = await getAppDownloads();

    return (
        <main className="space-y-6">
            <PageHeader
                title="App Downloads"
                description="Desktop products published on the STG website. Toggling availability controls public visibility — files and records are never deleted from here."
            />

            <section className="grid gap-4 sm:grid-cols-3">
                <StatChip label="Total Products" value={counts.total} />
                <StatChip label="Publicly Available" value={counts.active} />
                <StatChip label="Hidden" value={counts.inactive} />
            </section>

            <section className="space-y-4">
                {apps.length > 0 ? (
                    apps.map((app) => <AppCard key={app.id} app={app} />)
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                        <h2 className="text-lg font-semibold text-zinc-100">
                            No app downloads found
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Desktop products published from the STG website
                            will appear here.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

function StatChip({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-[#d4af37]/15 bg-black/45 p-5 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {value}
            </p>
        </div>
    );
}

function AppCard({ app }: { app: AppDownloadItem }) {
    const activateWithId = activateAppDownload.bind(null, app.id);
    const deactivateWithId = deactivateAppDownload.bind(null, app.id);

    return (
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3">
                        <Package className="h-5 w-5 text-[#d4af37]" />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold text-zinc-50">
                                {app.name}
                            </h2>

                            {app.isActive ? (
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    Publicly Available
                                </span>
                            ) : (
                                <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs font-semibold text-zinc-400">
                                    Hidden
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-zinc-400">
                            {displayValue(app.slug)}
                            {app.version ? ` · v${app.version}` : ""}
                            {" · Updated "}
                            {formatShortDate(app.updatedAt)}
                        </p>

                        {app.description ? (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                                {app.description}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <a
                        href={app.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-yellow-500/40 hover:text-yellow-100"
                    >
                        <ExternalLink className="h-4 w-4" />
                        File
                    </a>

                    {app.isActive ? (
                        <form action={deactivateWithId}>
                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-red-500/40 hover:text-red-200"
                            >
                                <PowerOff className="h-4 w-4" />
                                Hide from site
                            </button>
                        </form>
                    ) : (
                        <form action={activateWithId}>
                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
                            >
                                <Power className="h-4 w-4" />
                                Make available
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </article>
    );
}
