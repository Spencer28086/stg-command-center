import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SubscriptionInboxFilter =
    | "all"
    | "active"
    | "trialing"
    | "canceled";

const subscriptionSelect = {
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    stripeCustomerId: true,
    currentPeriodEnd: true,
    trialEnd: true,
    cancelAtPeriodEnd: true,
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
            displayPrice: true,
        },
    },
} satisfies Prisma.SubscriptionSelect;

export type SubscriptionInboxItem = Prisma.SubscriptionGetPayload<{
    select: typeof subscriptionSelect;
}>;

const activeWhere: Prisma.SubscriptionWhereInput = {
    status: {
        in: ["active", "ACTIVE"],
    },
};

const trialingWhere: Prisma.SubscriptionWhereInput = {
    status: {
        in: ["trialing", "TRIALING"],
    },
};

const canceledWhere: Prisma.SubscriptionWhereInput = {
    status: {
        in: ["canceled", "CANCELED", "cancelled", "CANCELLED"],
    },
};

export async function getSubscriptionsInbox(
    filter: SubscriptionInboxFilter = "all",
) {
    const where: Prisma.SubscriptionWhereInput =
        filter === "active"
            ? activeWhere
            : filter === "trialing"
                ? trialingWhere
                : filter === "canceled"
                    ? canceledWhere
                    : {};

    const [
        subscriptions,
        totalCount,
        activeCount,
        trialingCount,
        canceledCount,
    ] = await prisma.$transaction([
        prisma.subscription.findMany({
            where,
            select: subscriptionSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        }),
        prisma.subscription.count(),
        prisma.subscription.count({
            where: activeWhere,
        }),
        prisma.subscription.count({
            where: trialingWhere,
        }),
        prisma.subscription.count({
            where: canceledWhere,
        }),
    ]);

    return {
        subscriptions,
        counts: {
            all: totalCount,
            active: activeCount,
            trialing: trialingCount,
            canceled: canceledCount,
        },
    };
}

export function normalizeSubscriptionInboxFilter(
    value: string | string[] | undefined,
): SubscriptionInboxFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (
        filter === "active" ||
        filter === "trialing" ||
        filter === "canceled" ||
        filter === "cancelled"
    ) {
        return filter === "cancelled" ? "canceled" : filter;
    }

    return "all";
}
