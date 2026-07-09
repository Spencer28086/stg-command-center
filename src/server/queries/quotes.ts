import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Quotes are ClientProject records in their pre-acceptance lifecycle.
 *
 * Lifecycle (set by the STG website admin, which creates and emails
 * quotes): DRAFT / QUOTE_DRAFT -> QUOTE_SENT -> accepted (acceptedAt
 * set via client onboarding) or QUOTE_FAILED (PDF/email failure).
 *
 * The Command Center views and annotates quotes. Creation, PDF
 * generation, and email sending stay on the website.
 */

export type QuoteFilter = "all" | "draft" | "sent" | "accepted" | "failed";

export type QuoteStage = "draft" | "sent" | "accepted" | "failed" | "other";

const quoteListSelect = {
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    clientName: true,
    clientEmail: true,
    businessName: true,
    projectName: true,
    selectedBuildTier: true,
    projectType: true,
    totalProjectCost: true,
    depositAmount: true,
    monthlyPayment: true,
    paymentStructure: true,
    carePlanTier: true,
    carePlanMonthly: true,
    acceptedAt: true,
    completedAt: true,
    onboardingViewedAt: true,
    pdfUrl: true,
} satisfies Prisma.ClientProjectSelect;

export type QuoteListItem = Prisma.ClientProjectGetPayload<{
    select: typeof quoteListSelect;
}> & { stage: QuoteStage; quoteNumber: string };

const DRAFT_STATUSES = ["DRAFT", "QUOTE_DRAFT"];

export function getQuoteStage(quote: {
    status: string;
    acceptedAt: Date | null;
}): QuoteStage {
    if (quote.acceptedAt) return "accepted";
    if (quote.status === "QUOTE_FAILED") return "failed";
    if (quote.status === "QUOTE_SENT") return "sent";
    if (DRAFT_STATUSES.includes(quote.status)) return "draft";
    return "other";
}

/**
 * Same derivation the website uses when generating the PDF:
 * STG-Q-{year}-{last 8 of id, uppercased}.
 */
export function getQuoteNumber(quote: { id: string; createdAt: Date }): string {
    return `STG-Q-${quote.createdAt.getFullYear()}-${quote.id
        .slice(-8)
        .toUpperCase()}`;
}

function buildQuoteWhere(filter: QuoteFilter): Prisma.ClientProjectWhereInput {
    switch (filter) {
        case "draft":
            return { status: { in: DRAFT_STATUSES }, acceptedAt: null };
        case "sent":
            return { status: "QUOTE_SENT", acceptedAt: null };
        case "accepted":
            return { acceptedAt: { not: null } };
        case "failed":
            return { status: "QUOTE_FAILED" };
        default:
            return {};
    }
}

export async function getQuotes(filter: QuoteFilter = "all") {
    const [projects, totalCount, draftCount, sentCount, acceptedCount, failedCount] =
        await prisma.$transaction([
            prisma.clientProject.findMany({
                where: buildQuoteWhere(filter),
                select: quoteListSelect,
                orderBy: {
                    createdAt: "desc",
                },
                take: 100,
            }),
            prisma.clientProject.count(),
            prisma.clientProject.count({ where: buildQuoteWhere("draft") }),
            prisma.clientProject.count({ where: buildQuoteWhere("sent") }),
            prisma.clientProject.count({ where: buildQuoteWhere("accepted") }),
            prisma.clientProject.count({ where: buildQuoteWhere("failed") }),
        ]);

    const quotes: QuoteListItem[] = projects.map((project) => ({
        ...project,
        stage: getQuoteStage(project),
        quoteNumber: getQuoteNumber(project),
    }));

    return {
        quotes,
        counts: {
            all: totalCount,
            draft: draftCount,
            sent: sentCount,
            accepted: acceptedCount,
            failed: failedCount,
        },
    };
}

export async function getQuoteById(id: string) {
    const project = await prisma.clientProject.findUnique({
        where: {
            id,
        },
        include: {
            proposal: true,
            sourceRequest: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    type: true,
                },
            },
            audits: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 20,
            },
        },
    });

    if (!project) {
        return null;
    }

    return {
        ...project,
        stage: getQuoteStage(project),
        quoteNumber: getQuoteNumber(project),
    };
}

export function normalizeQuoteFilter(
    value: string | string[] | undefined,
): QuoteFilter {
    const filter = Array.isArray(value) ? value[0] : value;

    if (
        filter === "draft" ||
        filter === "sent" ||
        filter === "accepted" ||
        filter === "failed"
    ) {
        return filter;
    }

    return "all";
}

/**
 * Defensive parse for Json string-array columns
 * (includedFeatures, deliverables, excludedItems).
 */
export function parseStringList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === "string");
}
