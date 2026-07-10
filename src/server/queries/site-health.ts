import { prisma } from "@/lib/prisma";

export type HealthStatus = "healthy" | "warning" | "issue";

export type EnvCheck = {
    name: string;
    configured: boolean;
    required: boolean;
};

export type ProviderCheck = {
    name: string;
    configured: boolean;
    detail: string;
};

export type HealthWarning = {
    title: string;
    description: string;
    severity: "info" | "warning";
};

export type DatabaseCounts = {
    systemRequests: number;
    supportTickets: number;
    maintenanceAgreements: number;
    subscriptions: number;
};

export type OperationalCounts = {
    newRequests: number;
    openSupportTickets: number;
    pendingAgreements: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
};

export type ConsistencyInfo = {
    signedAgreements: number;
    notes: { label: string; description: string }[];
};

export type SiteHealthResult = {
    checkedAt: Date;
    database: {
        connected: boolean;
        serverTime?: Date;
        error?: string;
        counts?: DatabaseCounts;
    };
    operations?: OperationalCounts;
    env: EnvCheck[];
    providers: ProviderCheck[];
    warnings: HealthWarning[];
    consistency?: ConsistencyInfo;
    summary: {
        database: HealthStatus;
        environment: HealthStatus;
        providers: HealthStatus;
        openWork: HealthStatus;
    };
};

type HealthRow = {
    server_time: Date;
};

/**
 * Required env vars for the Command Center to operate.
 * Presence only — values are never read into the result.
 */
const REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "COMMAND_CENTER_USER",
    "COMMAND_CENTER_PASSWORD",
] as const;

/**
 * Optional/provider env vars. Missing entries downgrade to
 * "not configured", never to an issue.
 */
const OPTIONAL_ENV_VARS = [
    "STRIPE_SECRET_KEY",
    "RESEND_API_KEY",
    "BLOB_READ_WRITE_TOKEN",
    "NEXT_PUBLIC_SITE_URL",
    "STG_SITE_URL",
    "STG_SERVICE_API_KEY",
] as const;

function isEnvConfigured(name: string): boolean {
    const value = process.env[name];
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Strip anything that looks like a connection string or credential
 * out of error messages before they reach the UI.
 */
function sanitizeErrorMessage(message: string): string {
    return message
        .replace(/postgres(ql)?:\/\/\S+/gi, "[redacted connection string]")
        .replace(/(password|secret|token|key)=\S+/gi, "$1=[redacted]");
}

export async function getSiteHealth(): Promise<SiteHealthResult> {
    const checkedAt = new Date();

    // ── Environment health (presence only) ──────────────────────────
    const env: EnvCheck[] = [
        ...REQUIRED_ENV_VARS.map((name) => ({
            name,
            configured: isEnvConfigured(name),
            required: true,
        })),
        ...OPTIONAL_ENV_VARS.map((name) => ({
            name,
            configured: isEnvConfigured(name),
            required: false,
        })),
    ];

    const missingRequiredEnv = env.filter(
        (entry) => entry.required && !entry.configured,
    );

    // ── Provider health (config presence, no external API calls) ────
    const providers: ProviderCheck[] = [
        {
            name: "Stripe",
            configured: isEnvConfigured("STRIPE_SECRET_KEY"),
            detail: "Payments and subscriptions",
        },
        {
            name: "Resend",
            configured: isEnvConfigured("RESEND_API_KEY"),
            detail: "Transactional email",
        },
        {
            name: "Vercel Blob",
            configured: isEnvConfigured("BLOB_READ_WRITE_TOKEN"),
            detail: "File and PDF storage",
        },
    ];

    // ── Database health ──────────────────────────────────────────────
    let database: SiteHealthResult["database"];
    let operations: OperationalCounts | undefined;
    let consistency: ConsistencyInfo | undefined;

    try {
        const [
            timeRows,
            systemRequests,
            supportTickets,
            maintenanceAgreements,
            subscriptions,
            newRequests,
            openSupportTickets,
            pendingAgreements,
            activeSubscriptions,
            trialingSubscriptions,
            signedAgreements,
        ] = await Promise.all([
            prisma.$queryRaw<HealthRow[]>`SELECT NOW() AS server_time;`,
            prisma.systemRequest.count(),
            prisma.supportTicket.count(),
            prisma.maintenanceAgreement.count(),
            prisma.subscription.count(),
            prisma.systemRequest.count({ where: { contacted: false } }),
            prisma.supportTicket.count({ where: { status: "OPEN" } }),
            prisma.maintenanceAgreement.count({
                where: { status: "PENDING_SIGNATURE" },
            }),
            prisma.subscription.count({
                where: { status: { in: ["active", "ACTIVE"] } },
            }),
            prisma.subscription.count({
                where: { status: { in: ["trialing", "TRIALING"] } },
            }),
            prisma.maintenanceAgreement.count({
                where: {
                    OR: [
                        { signedAt: { not: null } },
                        { status: { in: ["SIGNED", "signed", "ACTIVE", "active"] } },
                    ],
                },
            }),
        ]);

        database = {
            connected: true,
            serverTime: timeRows[0]?.server_time,
            counts: {
                systemRequests,
                supportTickets,
                maintenanceAgreements,
                subscriptions,
            },
        };

        operations = {
            newRequests,
            openSupportTickets,
            pendingAgreements,
            activeSubscriptions,
            trialingSubscriptions,
        };

        consistency = {
            signedAgreements,
            notes: [
                {
                    label: "Client Count Source",
                    description:
                        "Real clients are currently counted from signed maintenance agreements. ClientAccount records are not used as real clients yet.",
                },
                {
                    label: "MRR Source",
                    description:
                        "MRR is currently calculated from signed maintenance agreement partnershipRate/monthlyAmount.",
                },
                {
                    label: "Subscription Source",
                    description:
                        "Product subscriptions come from the Subscription table. Website partnerships are managed under Agreements.",
                },
            ],
        };
    } catch (error) {
        database = {
            connected: false,
            error: sanitizeErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unknown database connection error",
            ),
        };
    }

    // ── Warnings ─────────────────────────────────────────────────────
    const warnings: HealthWarning[] = [];

    if (!database.connected) {
        warnings.push({
            title: "Database unreachable",
            description:
                "Prisma could not connect to the STG database. Operational counts are unavailable until the connection recovers.",
            severity: "warning",
        });
    }

    if (missingRequiredEnv.length > 0) {
        warnings.push({
            title: "Missing required configuration",
            description: `Required environment variables are not set: ${missingRequiredEnv
                .map((entry) => entry.name)
                .join(", ")}.`,
            severity: "warning",
        });
    }

    if (operations) {
        if (operations.newRequests > 0) {
            warnings.push({
                title: `${operations.newRequests} new request${operations.newRequests === 1 ? "" : "s"} waiting`,
                description:
                    "System requests have not been marked contacted. Review them under Requests.",
                severity: "warning",
            });
        }

        if (operations.openSupportTickets > 0) {
            warnings.push({
                title: `${operations.openSupportTickets} open support ticket${operations.openSupportTickets === 1 ? "" : "s"}`,
                description:
                    "Open tickets are waiting for a response. Review them under Support.",
                severity: "warning",
            });
        }

        if (operations.pendingAgreements > 0) {
            warnings.push({
                title: `${operations.pendingAgreements} agreement${operations.pendingAgreements === 1 ? "" : "s"} pending signature`,
                description:
                    "Maintenance agreements are awaiting client signature. Review them under Agreements.",
                severity: "warning",
            });
        }

        if (
            operations.trialingSubscriptions > 0 &&
            operations.activeSubscriptions === 0
        ) {
            warnings.push({
                title: "Trialing subscriptions without active conversions",
                description:
                    "Product subscriptions exist in trial status, but none are active yet.",
                severity: "info",
            });
        } else if (operations.trialingSubscriptions > 0) {
            warnings.push({
                title: `${operations.trialingSubscriptions} subscription${operations.trialingSubscriptions === 1 ? "" : "s"} in trial`,
                description:
                    "Trialing product subscriptions have not converted to active yet.",
                severity: "info",
            });
        }
    }

    warnings.push({
        title: "ClientAccount not wired as client source",
        description:
            "ClientAccount records exist in the schema but are not used as the real client source yet. Clients are derived from signed agreements.",
        severity: "info",
    });

    // ── Summary statuses ─────────────────────────────────────────────
    const openWorkCount = operations
        ? operations.newRequests +
          operations.openSupportTickets +
          operations.pendingAgreements
        : 0;

    const summary: SiteHealthResult["summary"] = {
        database: database.connected ? "healthy" : "issue",
        environment:
            missingRequiredEnv.length > 0
                ? "issue"
                : env.some((entry) => !entry.configured)
                  ? "warning"
                  : "healthy",
        providers: providers.every((provider) => provider.configured)
            ? "healthy"
            : "warning",
        openWork: !database.connected
            ? "issue"
            : openWorkCount > 0
              ? "warning"
              : "healthy",
    };

    return {
        checkedAt,
        database,
        operations,
        env,
        providers,
        warnings,
        consistency,
        summary,
    };
}
