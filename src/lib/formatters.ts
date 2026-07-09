export type MoneyInput =
    | number
    | string
    | {
        toString: () => string;
    }
    | null
    | undefined;

export function displayValue(
    value: string | number | null | undefined,
    fallback = "—",
) {
    if (value === null || value === undefined) {
        return fallback;
    }

    const display = String(value).trim();

    return display.length > 0 ? display : fallback;
}

export function formatStatus(status: string) {
    return status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

export function formatMoney(value: MoneyInput) {
    if (value === null || value === undefined) {
        return "—";
    }

    const amount =
        typeof value === "number" ? value : Number(value.toString());

    if (!Number.isFinite(amount)) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export function formatShortDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

export function formatDateOnly(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}
