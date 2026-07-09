"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * The only quote mutation in the Command Center: internal notes.
 *
 * Quote creation, PDF generation, email delivery, status changes,
 * and deletion all stay on the STG website admin, which owns the
 * Resend/Puppeteer/Blob pipeline and the deletion safety guards.
 */
export async function updateQuoteInternalNotes(id: string, formData: FormData) {
    const rawNotes = formData.get("internalNotes");
    const internalNotes =
        typeof rawNotes === "string" ? rawNotes.trim() : "";

    await prisma.clientProject.update({
        where: {
            id,
        },
        data: {
            internalNotes: internalNotes.length > 0 ? internalNotes : null,
        },
    });

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}`);
    redirect(`/quotes/${id}`);
}
