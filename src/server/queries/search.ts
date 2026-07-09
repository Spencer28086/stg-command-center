import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SearchResultItem = {
    id: string;
    title: string;
    detail: string;
    href: string;
    label: string;
    createdAt: Date;
};

export type GlobalSearchResults = {
    requests: SearchResultItem[];
    agreements: SearchResultItem[];
    clients: SearchResultItem[];
    supportTickets: SearchResultItem[];
    subscriptions: SearchResultItem[];
};

const emptyResults: GlobalSearchResults = {
    requests: [],
    agreements: [],
    clients: [],
    supportTickets: [],
    subscriptions: [],
};

function displayValue(value: string | null | undefined, fallback = "Unknown") {
    return value && value.trim().length > 0 ? value : fallback;
}

function normalizeSearchTerm(query: string | string[] | undefined) {
    const value = Array.isArray(query) ? query[0] : query;
    return value?.trim() ?? "";
}

function contains(term: string): Prisma.StringFilter {
    return {
        contains: term,
        mode: "insensitive",
    };
}

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

const signedAgreementWhere: Prisma.MaintenanceAgreementWhereInput = {
    OR: [
        { signedAt: { not: null } },
        { status: { in: ["SIGNED", "signed", "ACTIVE", "active"] } },
    ],
};

export function getSearchTerm(query: string | string[] | undefined) {
    return normalizeSearchTerm(query);
}

export async function searchCommandCenter(
    query: string | string[] | undefined,
): Promise<GlobalSearchResults> {
    const term = normalizeSearchTerm(query);

    if (term.length < 2) {
        return emptyResults;
    }

    const stringFilter = contains(term);
    const agreementSearchWhere: Prisma.MaintenanceAgreementWhereInput = {
        OR: [
            { id: stringFilter },
            { clientName: stringFilter },
            { clientEmail: stringFilter },
            { businessName: stringFilter },
            { status: stringFilter },
        ],
    };

    const [
        requests,
        agreements,
        clients,
        supportTickets,
        subscriptions,
    ] = await prisma.$transaction([
        prisma.systemRequest.findMany({
            where: {
                OR: [
                    { id: stringFilter },
                    { name: stringFilter },
                    { email: stringFilter },
                    { business: stringFilter },
                    { type: stringFilter },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                business: true,
                type: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),
        prisma.maintenanceAgreement.findMany({
            where: agreementSearchWhere,
            select: {
                id: true,
                clientName: true,
                clientEmail: true,
                businessName: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),
        prisma.maintenanceAgreement.findMany({
            where: {
                AND: [signedAgreementWhere, agreementSearchWhere],
            },
            select: {
                id: true,
                clientName: true,
                clientEmail: true,
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
            take: 8,
        }),
        prisma.supportTicket.findMany({
            where: {
                OR: [
                    { id: stringFilter },
                    { name: stringFilter },
                    { email: stringFilter },
                    { businessName: stringFilter },
                    { subject: stringFilter },
                    { category: stringFilter },
                    { status: stringFilter },
                    { priority: stringFilter },
                ],
            },
            select: {
                id: true,
                subject: true,
                name: true,
                email: true,
                businessName: true,
                category: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),
        prisma.subscription.findMany({
            where: {
                OR: [
                    { id: stringFilter },
                    { status: stringFilter },
                    { stripeCustomerId: stringFilter },
                    {
                        user: {
                            is: {
                                OR: [
                                    { email: stringFilter },
                                    { firstName: stringFilter },
                                    { lastName: stringFilter },
                                    { businessName: stringFilter },
                                ],
                            },
                        },
                    },
                    {
                        plan: {
                            is: {
                                name: stringFilter,
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                stripeCustomerId: true,
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
            take: 8,
        }),
    ]);

    return {
        requests: requests.map((request) => ({
            id: request.id,
            title: displayValue(request.name),
            detail: `${displayValue(request.business, "No business")} · ${request.type} · ${request.email}`,
            href: `/requests/${request.id}`,
            label: "Request",
            createdAt: request.createdAt,
        })),
        agreements: agreements.map((agreement) => ({
            id: agreement.id,
            title: displayValue(agreement.clientName),
            detail: `${displayValue(agreement.businessName)} · ${agreement.status} · ${agreement.clientEmail}`,
            href: `/agreements/${agreement.id}`,
            label: "Agreement",
            createdAt: agreement.createdAt,
        })),
        clients: clients.map((client) => ({
            id: client.id,
            title: displayValue(client.clientName),
            detail: `${displayValue(client.businessName)} · ${client.status} · ${client.clientEmail}`,
            href: `/clients/${client.id}`,
            label: "Signed Client",
            createdAt: client.signedAt ?? client.createdAt,
        })),
        supportTickets: supportTickets.map((ticket) => ({
            id: ticket.id,
            title: displayValue(ticket.subject),
            detail: `${displayValue(ticket.businessName, ticket.name)} · ${ticket.category} · ${ticket.email}`,
            href: `/support/${ticket.id}`,
            label: "Support",
            createdAt: ticket.createdAt,
        })),
        subscriptions: subscriptions.map((subscription) => ({
            id: subscription.id,
            title: formatClientName(subscription.user),
            detail: `${subscription.plan.name} · ${subscription.status} · ${subscription.user.email}`,
            href: "/subscriptions",
            label: "Subscription",
            createdAt: subscription.createdAt,
        })),
    };
}
