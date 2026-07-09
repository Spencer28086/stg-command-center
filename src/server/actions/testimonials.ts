"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Testimonial moderation actions.
 *
 * These only toggle the `approved` flag. There is intentionally no
 * delete action — records stay in the database, matching the
 * Command Center rule against destructive operations.
 *
 * Approving a testimonial makes it publicly visible on the STG
 * website case study pages, so approval is an explicit action here.
 */

function revalidateTestimonialPaths() {
    revalidatePath("/testimonials");
    revalidatePath("/");
}

export async function approveTestimonial(id: string) {
    await prisma.caseStudyTestimonial.update({
        where: {
            id,
        },
        data: {
            approved: true,
        },
    });

    revalidateTestimonialPaths();
}

export async function revokeTestimonialApproval(id: string) {
    await prisma.caseStudyTestimonial.update({
        where: {
            id,
        },
        data: {
            approved: false,
        },
    });

    revalidateTestimonialPaths();
}
