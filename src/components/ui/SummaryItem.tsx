import { displayValue } from "@/lib/formatters";

export function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </p>
            <p className="mt-1 break-words text-sm text-zinc-200">
                {displayValue(value)}
            </p>
        </div>
    );
}
