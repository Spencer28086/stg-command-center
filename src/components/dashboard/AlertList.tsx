import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

type AlertItem = {
    title: string;
    description: string;
    severity: "info" | "success" | "warning";
};

const severityConfig = {
    info: {
        icon: Info,
        className: "border-[#d4af37]/20 bg-[#d4af37]/10 text-stone-100",
    },
    success: {
        icon: CheckCircle2,
        className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    },
    warning: {
        icon: TriangleAlert,
        className: "border-[#d4af37]/30 bg-[#2a1f0b]/70 text-[#f5d77b]",
    },
};

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
    return (
        <section className="rounded-3xl border border-[#d4af37]/15 bg-black/45 p-6 shadow-2xl shadow-black/30">
            <div>
                <h2 className="text-lg font-semibold text-white">System Alerts</h2>
                <p className="mt-1 text-sm text-stone-400">
                    Early Command Center readiness checks.
                </p>
            </div>

            <div className="mt-6 space-y-3">
                {alerts.map((alert) => {
                    const config = severityConfig[alert.severity];
                    const Icon = config.icon;

                    return (
                        <div
                            key={alert.title}
                            className={`rounded-2xl border p-4 ${config.className}`}
                        >
                            <div className="flex gap-3">
                                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">{alert.title}</p>
                                    <p className="mt-1 text-sm leading-6 opacity-75">
                                        {alert.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}