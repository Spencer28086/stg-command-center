import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TestimonialFilter = "all" | "pending" | "approved";

const testimonialSelect = {
    id: true,
    project: true,
    quote: true,
    name: true,
    role: true,
    approved: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.CaseStudyTestimonialSelect;

export type TestimonialItem = Prisma.CaseStudyTestimonialGetPayload<{
    select: typeof testimonialSelect;
}>;

export async function getTestimonials(filter: TestimonialFilter = "all") {
    const where: Prisma.CaseStudyTestimonialWhereInput =
        filter === "pending"
            ? { approved: false }
            : filter === "approved"
              ? { approved: true }
              : {};

    const [testimonials, totalCount, approvedCount] = await prisma.$transaction([
        prisma.caseStudyTestimonial.findMany({
            where,
            select: testimonialSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        }),
        prisma.caseStudyTestimonial.count(),
        prisma.caseStudyTestimonial.count({
            where: {
                approved: true,
            },
        }),
    ]);

    return {
        testimonials,
        counts: {
            all: totalCount,
            pending: totalCount - approvedCount,
            approved: approvedCount,
        },
    };
}

export function normalizeTestimonialFilter(
    value: string | string[] | undefined,
): TestimonialFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (filter === "pending" || filter === "approved") {
        return filter;
    }

    return "all";
}
