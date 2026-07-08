import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SupportInboxFilter =
    | "all"
    | "open"
    | "resolved"
    | "high"
    | "normal";

const supportTicketSelect = {
    id: true,
    createdAt: true,
    updatedAt: true,
    name: true,
    email: true,
    businessName: true,
    category: true,
    subject: true,
    message: true,
    status: true,
    priority: true,
    resolvedAt: true,
} satisfies Prisma.SupportTicketSelect;

export type SupportInboxItem = Prisma.SupportTicketGetPayload<{
    select: typeof supportTicketSelect;
}>;

export async function getSupportInbox(filter: SupportInboxFilter = "all") {
    const resolvedWhere: Prisma.SupportTicketWhereInput = {
        OR: [
            { status: "RESOLVED" },
            { status: "CLOSED" },
            { resolvedAt: { not: null } },
        ],
    };

    const where: Prisma.SupportTicketWhereInput =
        filter === "open"
            ? { status: "OPEN" }
            : filter === "resolved"
                ? resolvedWhere
                : filter === "high"
                    ? { priority: "HIGH" }
                    : filter === "normal"
                        ? { priority: "NORMAL" }
                        : {};

    const [tickets, totalCount, openCount, resolvedCount, highCount, normalCount] =
        await prisma.$transaction([
            prisma.supportTicket.findMany({
                where,
                select: supportTicketSelect,
                orderBy: {
                    createdAt: "desc",
                },
                take: 100,
            }),
            prisma.supportTicket.count(),
            prisma.supportTicket.count({
                where: {
                    status: "OPEN",
                },
            }),
            prisma.supportTicket.count({
                where: resolvedWhere,
            }),
            prisma.supportTicket.count({
                where: {
                    priority: "HIGH",
                },
            }),
            prisma.supportTicket.count({
                where: {
                    priority: "NORMAL",
                },
            }),
        ]);

    return {
        tickets,
        counts: {
            all: totalCount,
            open: openCount,
            resolved: resolvedCount,
            high: highCount,
            normal: normalCount,
        },
    };
}

export async function getSupportTicketById(id: string) {
    return prisma.supportTicket.findUnique({
        where: {
            id,
        },
        select: supportTicketSelect,
    });
}

export function normalizeSupportInboxFilter(
    value: string | string[] | undefined,
): SupportInboxFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (
        filter === "open" ||
        filter === "resolved" ||
        filter === "high" ||
        filter === "normal"
    ) {
        return filter;
    }

    return "all";
}
