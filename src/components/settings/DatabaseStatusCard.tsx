import { CheckCircle2, Database, XCircle } from "lucide-react";
import { getDatabaseHealth } from "@/server/queries/database-health";

export async function DatabaseStatusCard() {
    const health = await getDatabaseHealth();

    return (
        <section className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3">
                        <Database className="h-5 w-5 text-[#d4af37]" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Database Connection
                        </h2>
                        <p className="mt-1 text-sm text-stone-400">
                            Read-only connection check for the STG database.
                        </p>
                    </div>
                </div>

                {health.connected ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                        <CheckCircle2 className="h-4 w-4" />
                        Connected
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                        <XCircle className="h-4 w-4" />
                        Offline
                    </div>
                )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                        Database
                    </p>
                    <p className="mt-2 text-sm text-stone-200">
                        {health.databaseName ?? "Unavailable"}
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                        Server Time
                    </p>
                    <p className="mt-2 text-sm text-stone-200">
                        {health.serverTime
                            ? health.serverTime.toLocaleString()
                            : "Unavailable"}
                    </p>
                </div>
            </div>

            {!health.connected && health.error ? (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                    <p className="text-sm font-medium text-red-100">
                        Connection Error
                    </p>
                    <p className="mt-2 break-words text-sm leading-6 text-red-100/75">
                        {health.error}
                    </p>
                </div>
            ) : null}
        </section>
    );
}