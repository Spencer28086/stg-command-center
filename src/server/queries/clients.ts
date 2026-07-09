import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ClientAgreementFilter = "all" | "signed" | "active";

const clientAgreementSelect = {
    id: true,
    createdAt: true,
    status: true,
    signedAt: true,
    partnershipRate: true,
    monthlyAmount: true,
    clientName: true,
    clientEmail: true,
    businessName: true,
} satisfies Prisma.MaintenanceAgreementSelect;

export type ClientAgreementItem = Prisma.MaintenanceAgreementGetPayload<{
    select: typeof clientAgreementSelect;
}>;

const relatedRequestSelect = {
    id: true,
    name: true,
    business: true,
    type: true,
    contacted: true,
    createdAt: true,
} satisfies Prisma.SystemRequestSelect;

const relatedSupportTicketSelect = {
    id: true,
    subject: true,
    category: true,
    status: true,
    priority: true,
    createdAt: true,
} satisfies Prisma.SupportTicketSelect;

const relatedSubscriptionSelect = {
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    stripeCustomerId: true,
    plan: {
        select: {
            name: true,
            displayPrice: true,
        },
    },
} satisfies Prisma.SubscriptionSelect;

export type RelatedClientRequest = Prisma.SystemRequestGetPayload<{
    select: typeof relatedRequestSelect;
}>;

export type RelatedClientSupportTicket = Prisma.SupportTicketGetPayload<{
    select: typeof relatedSupportTicketSelect;
}>;

export type RelatedClientSubscription = Prisma.SubscriptionGetPayload<{
    select: typeof relatedSubscriptionSelect;
}>;

export type ClientProfile = {
    agreement: ClientAgreementItem;
    requests: RelatedClientRequest[];
    supportTickets: RelatedClientSupportTicket[];
    subscriptions: RelatedClientSubscription[];
};

const signedAgreementWhere: Prisma.MaintenanceAgreementWhereInput = {
    OR: [
        { signedAt: { not: null } },
        { status: { in: ["SIGNED", "signed", "ACTIVE", "active"] } },
    ],
};

export type ClientMoneyValue =
    | ClientAgreementItem["partnershipRate"]
    | ClientAgreementItem["monthlyAmount"]
    | number
    | null
    | undefined;

export function parseMoneyValue(value: ClientMoneyValue): number {
    if (value === null || value === undefined) {
        return 0;
    }

    const amount =
        typeof value === "number" ? value : Number(value.toString());

    return Number.isFinite(amount) ? amount : 0;
}

export async function getClientsFromSignedAgreements(
    filter: ClientAgreementFilter = "all",
) {
    const where: Prisma.MaintenanceAgreementWhereInput =
        filter === "active"
            ? {
                AND: [
                    signedAgreementWhere,
                    { status: { in: ["ACTIVE", "active"] } },
                ],
            }
            : signedAgreementWhere;

    const [clients, signedAgreements] = await prisma.$transaction([
        prisma.maintenanceAgreement.findMany({
            where,
            select: clientAgreementSelect,
            orderBy: {
                signedAt: {
                    sort: "desc",
                    nulls: "last",
                },
            },
            take: 100,
        }),
        prisma.maintenanceAgreement.findMany({
            where: signedAgreementWhere,
            select: {
                partnershipRate: true,
                monthlyAmount: true,
                status: true,
            },
        }),
    ]);

    const activeCount = signedAgreements.filter((agreement) =>
        ["ACTIVE", "active"].includes(agreement.status),
    ).length;

    const monthlyRevenue = signedAgreements.reduce((total, agreement) => {
        return (
            total +
            (parseMoneyValue(agreement.partnershipRate) ||
                parseMoneyValue(agreement.monthlyAmount))
        );
    }, 0);

    return {
        clients,
        counts: {
            all: signedAgreements.length,
            signed: signedAgreements.length,
            active: activeCount,
        },
        monthlyRevenue,
    };
}

export async function getClientProfileByAgreementId(
    id: string,
): Promise<ClientProfile | null> {
    const agreement = await prisma.maintenanceAgreement.findFirst({
        where: {
            AND: [
                {
                    id,
                },
                signedAgreementWhere,
            ],
        },
        select: clientAgreementSelect,
    });

    if (!agreement) {
        return null;
    }

    const [requests, supportTickets, subscriptions] = await prisma.$transaction([
        prisma.systemRequest.findMany({
            where: {
                email: {
                    equals: agreement.clientEmail,
                    mode: "insensitive",
                },
            },
            select: relatedRequestSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),
        prisma.supportTicket.findMany({
            where: {
                email: {
                    equals: agreement.clientEmail,
                    mode: "insensitive",
                },
            },
            select: relatedSupportTicketSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),
        prisma.subscription.findMany({
            where: {
                user: {
                    is: {
                        email: {
                            equals: agreement.clientEmail,
                            mode: "insensitive",
                        },
                    },
                },
            },
            select: relatedSubscriptionSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),
    ]);

    return {
        agreement,
        requests,
        supportTickets,
        subscriptions,
    };
}

export function normalizeClientAgreementFilter(
    value: string | string[] | undefined,
): ClientAgreementFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (filter === "signed" || filter === "active") {
        return filter;
    }

    return "all";
}
