import { prisma } from "@/lib/prisma";

/**
 * The privileged key is an OPTIONAL second secret for user-management
 * actions. If COMMAND_CENTER_PRIVILEGED_KEY is set in the environment,
 * role changes and deletions require it; if unset, typed-email
 * confirmation alone is enough. This lets auth harden later with no
 * code change.
 */
export function isPrivilegedKeyConfigured(): boolean {
    const value = process.env.COMMAND_CENTER_PRIVILEGED_KEY;
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Read-only view of User account records.
 *
 * Deliberately no writes here: roles, passwords, 2FA, verification,
 * and deletion are all managed on the STG website, which owns the
 * full account-security flows (email verification, session
 * revocation, data export, soft delete).
 */

export type UserAccountItem = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    businessName: string | null;
    role: string;
    verified: boolean;
    twoFactorEnabled: boolean;
    createdAt: Date;
    deletedAt: Date | null;
    activeSessions: number;
    devices: number;
    subscriptions: number;
    /** Business ties that make an account a real client, not a test user. */
    maintenanceAgreements: number;
    clientProjects: number;
    qrCodes: number;
    supportTickets: number;
    hasStripeCustomer: boolean;
    /** True when the account has no business ties and can be hard-deleted. */
    deletable: boolean;
    /** Human-readable reasons deletion is blocked (empty when deletable). */
    deletionBlockers: string[];
};

function getDeletionBlockers(user: {
    role: string;
    subscriptions: number;
    maintenanceAgreements: number;
    clientProjects: number;
    hasStripeCustomer: boolean;
}): string[] {
    const blockers: string[] = [];

    if (user.role === "admin") {
        blockers.push("Admin account — demote to standard user first");
    }
    if (user.hasStripeCustomer) {
        blockers.push("Has a Stripe customer record");
    }
    if (user.subscriptions > 0) {
        blockers.push(`Has ${user.subscriptions} subscription record(s)`);
    }
    if (user.maintenanceAgreements > 0) {
        blockers.push(
            `Linked to ${user.maintenanceAgreements} maintenance agreement(s)`,
        );
    }
    if (user.clientProjects > 0) {
        blockers.push(`Linked to ${user.clientProjects} client project(s)`);
    }

    return blockers;
}

export async function getUserAccounts() {
    const now = new Date();

    const [users, totalCount, verifiedCount, twoFactorCount, adminCount] =
        await prisma.$transaction([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    businessName: true,
                    role: true,
                    verified: true,
                    twoFactorEnabled: true,
                    createdAt: true,
                    deletedAt: true,
                    stripeCustomerId: true,
                    _count: {
                        select: {
                            sessions: {
                                where: {
                                    revokedAt: null,
                                    refreshTokenExpiresAt: { gt: now },
                                },
                            },
                            devices: true,
                            subscriptions: true,
                            maintenanceAgreements: true,
                            clientProjects: true,
                            qrCodes: true,
                            supportTickets: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 100,
            }),
            prisma.user.count(),
            prisma.user.count({ where: { verified: true } }),
            prisma.user.count({ where: { twoFactorEnabled: true } }),
            prisma.user.count({ where: { role: "admin" } }),
        ]);

    const accounts: UserAccountItem[] = users.map((user) => {
        const base = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.businessName,
            role: user.role,
            verified: user.verified,
            twoFactorEnabled: user.twoFactorEnabled,
            createdAt: user.createdAt,
            deletedAt: user.deletedAt,
            activeSessions: user._count.sessions,
            devices: user._count.devices,
            subscriptions: user._count.subscriptions,
            maintenanceAgreements: user._count.maintenanceAgreements,
            clientProjects: user._count.clientProjects,
            qrCodes: user._count.qrCodes,
            supportTickets: user._count.supportTickets,
            hasStripeCustomer: Boolean(user.stripeCustomerId),
        };

        const deletionBlockers = getDeletionBlockers(base);

        return {
            ...base,
            deletable: deletionBlockers.length === 0,
            deletionBlockers,
        };
    });

    return {
        accounts,
        counts: {
            total: totalCount,
            verified: verifiedCount,
            twoFactor: twoFactorCount,
            admins: adminCount,
        },
    };
}
