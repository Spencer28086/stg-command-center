import { prisma } from "@/lib/prisma";

type DashboardSummary = {
    newRequests: number;
    pendingAgreements: number;
    openSupport: number;
    activeSubscriptions: number;
    clients: number;
    monthlyRecurringRevenue: number;
};

function parseMoneyValue(value: unknown): number {
    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "object" && "toNumber" in value) {
        const decimalValue = value as { toNumber: () => number };
        const parsed = decimalValue.toNumber();
        return Number.isFinite(parsed) ? parsed : 0;
    }

    const cleaned = String(value).replace(/[^0-9.]/g, "");
    const parsed = Number.parseFloat(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMonthlyAmount(displayPrice: string | null | undefined): number {
    if (!displayPrice) {
        return 0;
    }

    const amount = parseMoneyValue(displayPrice);
    const normalized = displayPrice.toLowerCase();

    if (
        normalized.includes("/year") ||
        normalized.includes("yearly") ||
        normalized.includes("annual")
    ) {
        return amount / 12;
    }

    return amount;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const [
        newRequests,
        pendingMaintenanceAgreements,
        pendingProjectProposals,
        openSupport,
        activeSubscriptions,
        signedAgreements,
        paidSubscriptions,
    ] = await Promise.all([
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

        prisma.projectProposal.count({
            where: {
                status: {
                    in: ["SENT", "SENT_TO_CLIENT", "PENDING", "PENDING_SIGNATURE"],
                },
            },
        }),

        prisma.supportTicket.count({
            where: {
                status: {
                    in: ["OPEN", "open"],
                },
            },
        }),

        prisma.subscription.count({
            where: {
                status: {
                    in: ["active", "ACTIVE"],
                },
            },
        }),

        prisma.maintenanceAgreement.findMany({
            where: {
                status: "SIGNED",
            },
            select: {
                partnershipRate: true,
                monthlyAmount: true,
            },
        }),

        prisma.subscription.findMany({
            where: {
                status: {
                    in: ["active", "ACTIVE"],
                },
            },
            select: {
                plan: {
                    select: {
                        displayPrice: true,
                    },
                },
            },
        }),
    ]);

    const partnershipMrr = signedAgreements.reduce((total, agreement) => {
        const partnershipRate = parseMoneyValue(agreement.partnershipRate);
        const monthlyAmount = parseMoneyValue(agreement.monthlyAmount);

        return total + (partnershipRate || monthlyAmount);
    }, 0);

    const subscriptionMrr = paidSubscriptions.reduce((total, subscription) => {
        return total + normalizeMonthlyAmount(subscription.plan.displayPrice);
    }, 0);

    return {
        newRequests,
        pendingAgreements: pendingMaintenanceAgreements + pendingProjectProposals,
        openSupport,
        activeSubscriptions,
        clients: signedAgreements.length,
        monthlyRecurringRevenue: partnershipMrr + subscriptionMrr,
    };
}