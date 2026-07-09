import { displayValue } from "@/lib/formatters";

export function MetaItem({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </dt>
            <dd className="mt-2 break-words text-sm text-zinc-200">
                {displayValue(value)}
            </dd>
        </div>
    );
}
