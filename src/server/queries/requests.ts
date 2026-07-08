import { Prisma } from "@prisma/client";
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
}>;

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

    return {
        requests,
        counts: {
            all: totalCount,
            new: totalCount - contactedCount,
            contacted: contactedCount,
        },
    };
}

export async function getRequestById(id: string) {
    return prisma.systemRequest.findUnique({
        where: {
            id,
        },
        select: requestInboxSelect,
    });
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