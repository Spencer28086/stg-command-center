import { Prisma } from "@prisma/client";
import { displayValue, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export type NotificationFeedFilter =
    | "all"
    | "requests"
    | "agreements"
    | "support"
    | "subscriptions";

export type NotificationFeedItem = {
    id: string;
    title: string;
    detail: string;
    href: string;
    category: Exclude<NotificationFeedFilter, "all">;
    label: string;
    tone: "gold" | "green" | "red" | "stone";
    createdAt: Date;
};

export type NotificationFeedCounts = {
    all: number;
    requests: number;
    agreements: number;
    support: number;
    subscriptions: number;
};

export type NotificationFeed = {
    items: NotificationFeedItem[];
    counts: NotificationFeedCounts;
};

const signedAgreementWhere: Prisma.MaintenanceAgreementWhereInput = {
    OR: [
        { signedAt: { not: null } },
        { status: { in: ["SIGNED", "signed", "ACTIVE", "active"] } },
    ],
};

const supportWatchWhere: Prisma.SupportTicketWhereInput = {
    OR: [
        { status: { in: ["OPEN", "open"] } },
        { priority: { in: ["HIGH", "high", "URGENT", "urgent"] } },
    ],
};

const trialingSubscriptionWhere: Prisma.SubscriptionWhereInput = {
    status: {
        in: ["trialing", "TRIALING"],
    },
};

const activeSubscriptionWhere: Prisma.SubscriptionWhereInput = {
    status: {
        in: ["active", "ACTIVE"],
    },
};

function formatClientName(user: {
    firstName: string | null;
    lastName: string | null;
    businessName: string | null;
    email: string;
}) {
    if (user.businessName) {
        return user.businessName;
    }

    const personalName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ");

    return personalName || user.email;
}

function filterItems(
    items: NotificationFeedItem[],
    filter: NotificationFeedFilter,
) {
    if (filter === "all") {
        return items;
    }

    return items.filter((item) => item.category === filter);
}

export async function getNotificationsFeed(
    filter: NotificationFeedFilter = "all",
): Promise<NotificationFeed> {
    const [
        newRequests,
        pendingAgreements,
        signedAgreements,
        supportTickets,
        trialingSubscriptions,
        activeSubscriptions,
        requestCount,
        pendingAgreementCount,
        signedAgreementCount,
        supportCount,
        trialingSubscriptionCount,
        activeSubscriptionCount,
    ] = await prisma.$transaction([
        prisma.systemRequest.findMany({
            where: {
                contacted: false,
            },
            select: {
                id: true,
                name: true,
                business: true,
                type: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 12,
        }),
        prisma.maintenanceAgreement.findMany({
            where: {
                status: "PENDING_SIGNATURE",
            },
            select: {
                id: true,
                clientName: true,
                businessName: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 12,
        }),
        prisma.maintenanceAgreement.findMany({
            where: signedAgreementWhere,
            select: {
                id: true,
                clientName: true,
                businessName: true,
                status: true,
                signedAt: true,
                createdAt: true,
            },
            orderBy: {
                signedAt: {
                    sort: "desc",
                    nulls: "last",
                },
            },
            take: 12,
        }),
        prisma.supportTicket.findMany({
            where: supportWatchWhere,
            select: {
                id: true,
                subject: true,
                businessName: true,
                name: true,
                status: true,
                priority: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 12,
        }),
        prisma.subscription.findMany({
            where: trialingSubscriptionWhere,
            select: {
                id: true,
                status: true,
                createdAt: true,
                trialEnd: true,
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        businessName: true,
                    },
                },
                plan: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 12,
        }),
        prisma.subscription.findMany({
            where: activeSubscriptionWhere,
            select: {
                id: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        businessName: true,
                    },
                },
                plan: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 12,
        }),
        prisma.systemRequest.count({
            where: {
                contacted: false,
            },
        }),
        prisma.maintenanceAgreement.count({
            where: {
                status: "PENDING_SIGNATURE",
            },
        }),
        prisma.maintenanceAgreement.count({
            where: signedAgreementWhere,
        }),
        prisma.supportTicket.count({
            where: supportWatchWhere,
        }),
        prisma.subscription.count({
            where: trialingSubscriptionWhere,
        }),
        prisma.subscription.count({
            where: activeSubscriptionWhere,
        }),
    ]);

    const items: NotificationFeedItem[] = [
        ...newRequests.map((request) => ({
            id: request.id,
            title: displayValue(request.name),
            detail: `${displayValue(request.business, "No business")} - ${request.type}`,
            href: `/requests/${request.id}`,
            category: "requests" as const,
            label: "New request",
            tone: "gold" as const,
            createdAt: request.createdAt,
        })),
        ...pendingAgreements.map((agreement) => ({
            id: agreement.id,
            title: displayValue(agreement.clientName),
            detail: `${displayValue(agreement.businessName)} - ${formatStatus(agreement.status)}`,
            href: `/agreements/${agreement.id}`,
            category: "agreements" as const,
            label: "Pending agreement",
            tone: "gold" as const,
            createdAt: agreement.createdAt,
        })),
        ...signedAgreements.map((agreement) => ({
            id: agreement.id,
            title: displayValue(agreement.clientName),
            detail: displayValue(agreement.businessName, "Signed agreement"),
            href: `/agreements/${agreement.id}`,
            category: "agreements" as const,
            label: "Signed agreement",
            tone: "green" as const,
            createdAt: agreement.signedAt ?? agreement.createdAt,
        })),
        ...supportTickets.map((ticket) => ({
            id: ticket.id,
            title: displayValue(ticket.subject),
            detail: `${displayValue(ticket.businessName, ticket.name)} - ${formatStatus(ticket.priority)}`,
            href: `/support/${ticket.id}`,
            category: "support" as const,
            label: formatStatus(ticket.status),
            tone:
                ticket.priority === "HIGH" ||
                    ticket.priority === "high" ||
                    ticket.priority === "URGENT" ||
                    ticket.priority === "urgent"
                    ? ("red" as const)
                    : ("gold" as const),
            createdAt: ticket.createdAt,
        })),
        ...trialingSubscriptions.map((subscription) => ({
            id: subscription.id,
            title: formatClientName(subscription.user),
            detail: subscription.trialEnd
                ? `${subscription.plan.name} - trial ends ${subscription.trialEnd.toLocaleDateString("en-US")}`
                : `${subscription.plan.name} - trial end not set`,
            href: "/subscriptions?filter=trialing",
            category: "subscriptions" as const,
            label: "Trialing",
            tone: "stone" as const,
            createdAt: subscription.createdAt,
        })),
        ...activeSubscriptions.map((subscription) => ({
            id: subscription.id,
            title: formatClientName(subscription.user),
            detail: `${subscription.plan.name} - ${formatStatus(subscription.status)}`,
            href: "/subscriptions?filter=active",
            category: "subscriptions" as const,
            label: "Active subscription",
            tone: "green" as const,
            createdAt: subscription.createdAt,
        })),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    const counts = {
        requests: requestCount,
        agreements: pendingAgreementCount + signedAgreementCount,
        support: supportCount,
        subscriptions: trialingSubscriptionCount + activeSubscriptionCount,
    };

    return {
        items: filterItems(items, filter).slice(0, 50),
        counts: {
            all:
                counts.requests +
                counts.agreements +
                counts.support +
                counts.subscriptions,
            ...counts,
        },
    };
}

export function normalizeNotificationFeedFilter(
    value: string | string[] | undefined,
): NotificationFeedFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (
        filter === "requests" ||
        filter === "agreements" ||
        filter === "support" ||
        filter === "subscriptions"
    ) {
        return filter;
    }

    return "all";
}
