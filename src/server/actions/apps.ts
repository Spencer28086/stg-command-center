"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * App download visibility actions.
 *
 * isActive controls whether a desktop product appears as available
 * on the STG website's software/downloads pages. Toggling it is
 * fully reversible; no records are created or deleted, and file
 * URLs are never modified from here.
 */

function revalidateAppPaths() {
    revalidatePath("/apps");
}

export async function activateAppDownload(id: string) {
    await prisma.appDownload.update({
        where: {
            id,
        },
        data: {
            isActive: true,
        },
    });

    revalidateAppPaths();
}

export async function deactivateAppDownload(id: string) {
    await prisma.appDownload.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });

    revalidateAppPaths();
}
