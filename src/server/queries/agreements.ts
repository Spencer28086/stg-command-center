import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AgreementInboxFilter =
    | "all"
    | "pending"
    | "signed"
    | "active"
    | "cancelled";

const agreementInboxSelect = {
    id: true,
    clientName: true,
    clientEmail: true,
    businessName: true,
    status: true,
    partnershipRate: true,
    monthlyAmount: true,
    internalNotes: true,
    signedAt: true,
    createdAt: true,
} satisfies Prisma.MaintenanceAgreementSelect;

export type AgreementInboxItem = Prisma.MaintenanceAgreementGetPayload<{
    select: typeof agreementInboxSelect;
}>;

export async function getAgreementsInbox(
    filter: AgreementInboxFilter = "all",
) {
    const where: Prisma.MaintenanceAgreementWhereInput =
        filter === "pending"
            ? { status: "PENDING_SIGNATURE" }
            : filter === "signed"
                ? { signedAt: { not: null } }
                : filter === "active"
                    ? { status: "ACTIVE" }
                    : filter === "cancelled"
                        ? { status: "CANCELLED" }
                        : {};

    const [
        agreements,
        totalCount,
        pendingCount,
        signedCount,
        activeCount,
        cancelledCount,
    ] = await prisma.$transaction([
        prisma.maintenanceAgreement.findMany({
            where,
            select: agreementInboxSelect,
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        }),
        prisma.maintenanceAgreement.count(),
        prisma.maintenanceAgreement.count({
            where: {
                status: "PENDING_SIGNATURE",
            },
        }),
        prisma.maintenanceAgreement.count({
            where: {
                signedAt: {
                    not: null,
                },
            },
        }),
        prisma.maintenanceAgreement.count({
            where: {
                status: "ACTIVE",
            },
        }),
        prisma.maintenanceAgreement.count({
            where: {
                status: "CANCELLED",
            },
        }),
    ]);

    return {
        agreements,
        counts: {
            all: totalCount,
            pending: pendingCount,
            signed: signedCount,
            active: activeCount,
            cancelled: cancelledCount,
        },
    };
}

export async function getAgreementById(id: string) {
    return prisma.maintenanceAgreement.findUnique({
        where: {
            id,
        },
        select: agreementInboxSelect,
    });
}

export function normalizeAgreementInboxFilter(
    value: string | string[] | undefined,
): AgreementInboxFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (
        filter === "pending" ||
        filter === "signed" ||
        filter === "active" ||
        filter === "cancelled"
    ) {
        return filter;
    }

    return "all";
}

export async function getClientAccountByAgreementId(agreementId: string) {
    return prisma.clientAccount.findUnique({
        where: {
            agreementId,
        },
    });
}
