import { Prisma } from "@prisma/client";
import { scoreLead, type LeadScore } from "@/lib/lead-score";
import { prisma } from "@/lib/prisma";

export type RequestInboxFilter = "all" | "new" | "contacted";

const requestInboxSelect = {
    id: true,
    name: true,
    business: true,
    email: true,
    type: true,
    referralCode: true,
    budget: true,
    details: true,
    contacted: true,
    createdAt: true,
} satisfies Prisma.SystemRequestSelect;

export type RequestInboxItem = Prisma.SystemRequestGetPayload<{
    select: typeof requestInboxSelect;
}> &
    LeadScore;

export async function getRequestsInbox(filter: RequestInboxFilter = "all") {
    const where: Prisma.SystemRequestWhereInput =
        filter === "new"
            ? { contacted: false }
            : filter === "contacted"
                ? { contacted: true }
                : {};

    const [requests, totalCount, contactedCount] = await prisma.$transaction([
        prisma.systemRequest.findMany({
            where,
            select: requestInboxSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        }),
        prisma.systemRequest.count(),
        prisma.systemRequest.count({
            where: {
                contacted: true,
            },
        }),
    ]);

    const scoredRequests: RequestInboxItem[] = requests.map((request) => ({
        ...request,
        ...scoreLead(request),
    }));

    return {
        requests: scoredRequests,
        counts: {
            all: totalCount,
            new: totalCount - contactedCount,
            contacted: contactedCount,
        },
        tierCounts: {
            high: scoredRequests.filter((request) => request.tier === "high")
                .length,
            medium: scoredRequests.filter(
                (request) => request.tier === "medium",
            ).length,
            low: scoredRequests.filter((request) => request.tier === "low")
                .length,
        },
    };
}

export async function getRequestById(id: string) {
    const request = await prisma.systemRequest.findUnique({
        where: {
            id,
        },
        select: requestInboxSelect,
    });

    if (!request) {
        return null;
    }

    return {
        ...request,
        ...scoreLead(request),
    };
}

export function normalizeRequestInboxFilter(
    value: string | string[] | undefined,
): RequestInboxFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (filter === "new" || filter === "contacted") {
        return filter;
    }

    return "all";
}