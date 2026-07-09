"use server";

import { revalidatePath } from "next/cache";

/**
 * Safe repair actions for the Site Health page.
 *
 * These actions ONLY revalidate Next.js cached route data.
 * They never read or write database records, never touch payments
 * or subscriptions, and never execute shell commands.
 *
 * Each action also revalidates /health so the "last checked"
 * timestamp refreshes after a repair runs.
 */

function revalidateHealthPage() {
    revalidatePath("/health");
}

export async function revalidateDashboard() {
    revalidatePath("/");
    revalidateHealthPage();
}

export async function revalidateRequests() {
    revalidatePath("/requests");
    revalidateHealthPage();
}

export async function revalidateAgreements() {
    revalidatePath("/agreements");
    revalidateHealthPage();
}

export async function revalidateSupport() {
    revalidatePath("/support");
    revalidateHealthPage();
}

export async function revalidateClients() {
    revalidatePath("/clients");
    revalidateHealthPage();
}

export async function revalidateSubscriptions() {
    revalidatePath("/subscriptions");
    revalidateHealthPage();
}

export async function revalidateAllCommandCenter() {
    revalidatePath("/");
    revalidatePath("/requests");
    revalidatePath("/agreements");
    revalidatePath("/support");
    revalidatePath("/clients");
    revalidatePath("/subscriptions");
    revalidatePath("/settings");
    revalidatePath("/health");
}
