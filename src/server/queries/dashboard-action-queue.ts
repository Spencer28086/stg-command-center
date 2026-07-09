import { prisma } from "@/lib/prisma";
import { displayValue } from "@/lib/formatters";

export type DashboardActionQueueItem = {
    id: string;
    title: string;
    detail: string;
    href: string;
    label: string;
    tone: "gold" | "red" | "green" | "stone";
    createdAt: Date;
};

export type DashboardActionQueue = {
    newRequests: DashboardActionQueueItem[];
    pendingAgreements: DashboardActionQueueItem[];
    openSupport: DashboardActionQueueItem[];
    trialingSubscriptions: DashboardActionQueueItem[];
    recentlySigned: DashboardActionQueueItem[];
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

export async function getDashboardActionQueue(): Promise<DashboardActionQueue> {
    const [
        newRequests,
        pendingAgreements,
        openSupport,
        trialingSubscriptions,
        recentlySigned,
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
            take: 4,
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
            take: 4,
        }),
        prisma.supportTicket.findMany({
            where: {
                OR: [
                    { status: { in: ["OPEN", "open"] } },
                    { priority: { in: ["HIGH", "high", "URGENT", "urgent"] } },
                ],
            },
            select: {
                id: true,
                subject: true,
                name: true,
                businessName: true,
                priority: true,
                createdAt: true,
            },
            orderBy: [
                {
                    priority: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
            take: 4,
        }),
        prisma.subscription.findMany({
            where: {
                status: {
                    in: ["trialing", "TRIALING"],
                },
            },
            select: {
                id: true,
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
                trialEnd: {
                    sort: "asc",
                    nulls: "last",
                },
            },
            take: 4,
        }),
        prisma.maintenanceAgreement.findMany({
            where: {
                OR: [
                    { signedAt: { not: null } },
                    { status: { in: ["SIGNED", "signed", "ACTIVE", "active"] } },
                ],
            },
            select: {
                id: true,
                clientName: true,
                businessName: true,
                signedAt: true,
                createdAt: true,
            },
            orderBy: {
                signedAt: {
                    sort: "desc",
                    nulls: "last",
                },
            },
            take: 4,
        }),
    ]);

    return {
        newRequests: newRequests.map((request) => ({
            id: request.id,
            title: displayValue(request.name),
            detail: `${displayValue(request.business, "No business")} · ${request.type}`,
            href: `/requests/${request.id}`,
            label: "New request",
            tone: "gold",
            createdAt: request.createdAt,
        })),
        pendingAgreements: pendingAgreements.map((agreement) => ({
            id: agreement.id,
            title: displayValue(agreement.clientName),
            detail: displayValue(agreement.businessName, agreement.status),
            href: `/agreements/${agreement.id}`,
            label: "Pending agreement",
            tone: "gold",
            createdAt: agreement.createdAt,
        })),
        openSupport: openSupport.map((ticket) => ({
            id: ticket.id,
            title: displayValue(ticket.subject),
            detail: `${displayValue(ticket.businessName, ticket.name)} · ${ticket.priority}`,
            href: `/support/${ticket.id}`,
            label: "Support",
            tone:
                ticket.priority === "HIGH" ||
                    ticket.priority === "high" ||
                    ticket.priority === "URGENT" ||
                    ticket.priority === "urgent"
                    ? "red"
                    : "gold",
            createdAt: ticket.createdAt,
        })),
        trialingSubscriptions: trialingSubscriptions.map((subscription) => ({
            id: subscription.id,
            title: formatClientName(subscription.user),
            detail: subscription.trialEnd
                ? `${subscription.plan.name} · trial ends ${subscription.trialEnd.toLocaleDateString("en-US")}`
                : `${subscription.plan.name} · trial end not set`,
            href: "/subscriptions?filter=trialing",
            label: "Trialing",
            tone: "stone",
            createdAt: subscription.createdAt,
        })),
        recentlySigned: recentlySigned.map((agreement) => ({
            id: agreement.id,
            title: displayValue(agreement.clientName),
            detail: displayValue(agreement.businessName, "Signed agreement"),
            href: `/agreements/${agreement.id}`,
            label: "Recently signed",
            tone: "green",
            createdAt: agreement.signedAt ?? agreement.createdAt,
        })),
    };
}
