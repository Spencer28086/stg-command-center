import { prisma } from "@/lib/prisma";

/**
 * Referral tracker data, read directly from the shared database.
 * Mirrors the site's /api/admin/referrals aggregation.
 * Uncapped = Monthly Partnership referrers (credits bank monthly).
 */

export type ReferrerSummary = {
    agreementId: string;
    name: string;
    code: string | null;
    tier: string | null;
    paymentStructure: string | null;
    rewardAmount: number;
    uncapped: boolean;
    maxCredit: number | null;
    creditsEarned: number;
    qualified: number;
    pending: number;
};

export type ReferralEvent = {
    id: string;
    code: string;
    status: string;
    referrerName: string;
    referredName: string;
    referrerCreditAmount: number | null;
    refereeCreditAmount: number | null;
    createdAt: Date;
    qualifiedAt: Date | null;
};

function isPartnership(paymentStructure?: string | null): boolean {
    return (paymentStructure ?? "")
        .toLowerCase()
        .includes("partnership");
}

export async function getReferralTracker() {
    const [referrerAgreements, referrals] = await Promise.all([
        prisma.maintenanceAgreement.findMany({
            where: {
                referralCode: { not: null },
                signedAt: { not: null },
            },
            select: {
                id: true,
                businessName: true,
                clientName: true,
                projectTier: true,
                paymentStructure: true,
                referralCode: true,
                referralRewardAmount: true,
                referralMaxCredit: true,
                referralCreditsEarned: true,
            },
            orderBy: { createdAt: "asc" },
        }),
        prisma.referral.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
        }),
    ]);

    const nameById = new Map(
        referrerAgreements.map((agreement) => [
            agreement.id,
            agreement.businessName || agreement.clientName,
        ]),
    );

    const missingIds = [
        ...new Set(
            referrals
                .flatMap((referral) => [
                    referral.referrerAgreementId,
                    referral.referredAgreementId,
                ])
                .filter((id) => !nameById.has(id)),
        ),
    ];

    if (missingIds.length > 0) {
        const missing = await prisma.maintenanceAgreement.findMany({
            where: { id: { in: missingIds } },
            select: {
                id: true,
                businessName: true,
                clientName: true,
            },
        });

        for (const agreement of missing) {
            nameById.set(
                agreement.id,
                agreement.businessName || agreement.clientName,
            );
        }
    }

    const statsByReferrer = new Map<
        string,
        { qualified: number; pending: number }
    >();

    for (const referral of referrals) {
        const stats = statsByReferrer.get(
            referral.referrerAgreementId,
        ) ?? { qualified: 0, pending: 0 };

        if (referral.status === "QUALIFIED") stats.qualified += 1;
        else if (referral.status === "PENDING") stats.pending += 1;

        statsByReferrer.set(referral.referrerAgreementId, stats);
    }

    const referrers: ReferrerSummary[] = referrerAgreements.map(
        (agreement) => {
            const uncapped = isPartnership(agreement.paymentStructure);
            const stats = statsByReferrer.get(agreement.id) ?? {
                qualified: 0,
                pending: 0,
            };

            return {
                agreementId: agreement.id,
                name: agreement.businessName || agreement.clientName,
                code: agreement.referralCode,
                tier: agreement.projectTier,
                paymentStructure: agreement.paymentStructure,
                rewardAmount: agreement.referralRewardAmount,
                uncapped,
                maxCredit: uncapped ? null : agreement.referralMaxCredit,
                creditsEarned: agreement.referralCreditsEarned,
                ...stats,
            };
        },
    );

    const events: ReferralEvent[] = referrals.map((referral) => ({
        id: referral.id,
        code: referral.code,
        status: referral.status,
        referrerName:
            nameById.get(referral.referrerAgreementId) ?? "Unknown",
        referredName:
            nameById.get(referral.referredAgreementId) ?? "Unknown",
        referrerCreditAmount:
            referral.referrerCreditAmount != null
                ? Number(referral.referrerCreditAmount)
                : null,
        refereeCreditAmount:
            referral.refereeCreditAmount != null
                ? Number(referral.refereeCreditAmount)
                : null,
        createdAt: referral.createdAt,
        qualifiedAt: referral.qualifiedAt,
    }));

    return {
        referrers,
        events,
        totals: {
            qualified: events.filter((e) => e.status === "QUALIFIED")
                .length,
            pending: events.filter((e) => e.status === "PENDING").length,
            creditsIssued: events.reduce(
                (sum, e) =>
                    e.status === "QUALIFIED"
                        ? sum + (e.referrerCreditAmount ?? 0)
                        : sum,
                0,
            ),
        },
    };
}
