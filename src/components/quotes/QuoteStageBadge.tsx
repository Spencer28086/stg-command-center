import type { QuoteStage } from "@/server/queries/quotes";

const styles: Record<QuoteStage, string> = {
    draft: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    sent: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    failed: "border-red-500/30 bg-red-500/10 text-red-300",
    other: "border-zinc-700 bg-zinc-900/60 text-zinc-400",
};

const labels: Record<QuoteStage, string> = {
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    failed: "Failed",
    other: "In Progress",
};

export function QuoteStageBadge({ stage }: { stage: QuoteStage }) {
    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[stage]}`}
        >
            {labels[stage]}
        </span>
    );
}
