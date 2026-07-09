"use server";

import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * User management actions.
 *
 * Safety model:
 * - Every action requires typing the account's exact email to confirm.
 * - If COMMAND_CENTER_PRIVILEGED_KEY is set, every action additionally
 *   requires that key. If unset, actions work with confirmation alone.
 * - Deletion is restricted to accounts with NO business ties: no
 *   subscriptions, no Stripe customer, no agreements, no client
 *   projects, and not an admin. Real clients fail these checks
 *   structurally, so only test accounts can ever be deleted.
 * - The last remaining admin can never be demoted.
 */

type ActionResult = { error?: string; notice?: string };

function finish(result: ActionResult): never {
    revalidatePath("/users");

    const params = new URLSearchParams();
    if (result.error) params.set("error", result.error);
    if (result.notice) params.set("notice", result.notice);

    redirect(`/users?${params.toString()}`);
}

function checkPrivilegedKey(formData: FormData): string | null {
    const expected = process.env.COMMAND_CENTER_PRIVILEGED_KEY?.trim();

    if (!expected) {
        return null; // Key not configured — not required.
    }

    const provided = formData.get("privilegedKey");

    if (typeof provided !== "string" || provided.trim().length === 0) {
        return "Privileged key is required for this action.";
    }

    const providedHash = createHash("sha256")
        .update(provided.trim())
        .digest();
    const expectedHash = createHash("sha256").update(expected).digest();

    if (!timingSafeEqual(providedHash, expectedHash)) {
        return "Privileged key is incorrect.";
    }

    return null;
}

function checkEmailConfirmation(
    formData: FormData,
    actualEmail: string,
): string | null {
    const typed = formData.get("confirmEmail");

    if (typeof typed !== "string" || typed.trim().length === 0) {
        return "Type the account email to confirm this action.";
    }

    if (typed.trim().toLowerCase() !== actualEmail.toLowerCase()) {
        return "The email you typed does not match this account.";
    }

    return null;
}

export async function promoteUserToAdmin(id: string, formData: FormData) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true },
    });

    if (!user) {
        finish({ error: "Account not found." });
    }

    const keyError = checkPrivilegedKey(formData);
    if (keyError) {
        finish({ error: keyError });
    }

    const confirmError = checkEmailConfirmation(formData, user.email);
    if (confirmError) {
        finish({ error: confirmError });
    }

    if (user.role === "admin") {
        finish({ error: `${user.email} is already an admin.` });
    }

    await prisma.user.update({
        where: { id },
        data: { role: "admin" },
    });

    finish({ notice: `${user.email} is now an admin.` });
}

export async function demoteUserToStandard(id: string, formData: FormData) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true },
    });

    if (!user) {
        finish({ error: "Account not found." });
    }

    const keyError = checkPrivilegedKey(formData);
    if (keyError) {
        finish({ error: keyError });
    }

    const confirmError = checkEmailConfirmation(formData, user.email);
    if (confirmError) {
        finish({ error: confirmError });
    }

    if (user.role !== "admin") {
        finish({ error: `${user.email} is not an admin.` });
    }

    const adminCount = await prisma.user.count({
        where: { role: "admin" },
    });

    if (adminCount <= 1) {
        finish({
            error: "Blocked: this is the last admin account. Promote another admin before demoting this one.",
        });
    }

    await prisma.user.update({
        where: { id },
        data: { role: "user" },
    });

    finish({ notice: `${user.email} is now a standard user.` });
}

export async function deleteTestUser(id: string, formData: FormData) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            role: true,
            stripeCustomerId: true,
            _count: {
                select: {
                    subscriptions: true,
                    maintenanceAgreements: true,
                    clientProjects: true,
                },
            },
        },
    });

    if (!user) {
        finish({ error: "Account not found." });
    }

    const keyError = checkPrivilegedKey(formData);
    if (keyError) {
        finish({ error: keyError });
    }

    const confirmError = checkEmailConfirmation(formData, user.email);
    if (confirmError) {
        finish({ error: confirmError });
    }

    // Business-tie guards: these make real client accounts structurally
    // undeletable from the Command Center, regardless of confirmation.
    if (user.role === "admin") {
        finish({
            error: "Blocked: admin accounts cannot be deleted. Demote to standard user first.",
        });
    }

    if (user.stripeCustomerId) {
        finish({
            error: "Blocked: this account has a Stripe customer record, so it is not a test user.",
        });
    }

    if (user._count.subscriptions > 0) {
        finish({
            error: "Blocked: this account has subscription records, so it is not a test user.",
        });
    }

    if (user._count.maintenanceAgreements > 0) {
        finish({
            error: "Blocked: this account is linked to maintenance agreements, so it is not a test user.",
        });
    }

    if (user._count.clientProjects > 0) {
        finish({
            error: "Blocked: this account is linked to client projects, so it is not a test user.",
        });
    }

    await prisma.user.delete({
        where: { id },
    });

    finish({
        notice: `Deleted test account ${user.email}. Sessions, devices, download grants, and QR codes for this account were removed with it.`,
    });
}
