"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteApiError, siteApiFetch } from "@/lib/site-api";

/**
 * Quote creation proxies to the STG website's quote pipeline
 * (validation, PDF generation, Blob storage, Resend email, audit
 * trail), authenticated with the shared service key. The pipeline
 * has exactly one implementation — on the site.
 */

type CreateQuoteResponse = {
    ok: boolean;
    projectId: string;
    quoteNumber: string;
    quoteUrl: string;
};

const SITE_ERROR_MESSAGES: Record<string, string> = {
    site_url_not_configured:
        "STG_SITE_URL is not set in the Command Center environment.",
    service_key_not_configured:
        "STG_SERVICE_API_KEY is not set in the Command Center environment.",
    site_unreachable:
        "Could not reach the STG website. Check that the site is up and STG_SITE_URL is correct.",
    unauthorized:
        "The site rejected the service key. Check STG_SERVICE_API_KEY matches on both sides.",
    email_not_configured:
        "The site's email provider (Resend) is not configured, so quotes cannot be sent.",
    invalid_body: "The site could not parse the quote payload.",
    invalid_quote_fields:
        "The site rejected the quote fields. Check required fields and amounts.",
    launch_before_start:
        "The estimated launch date is before the estimated start date.",
    request_not_found: "The source request no longer exists.",
    quote_send_failed:
        "The site accepted the quote but failed while generating or sending it. Check the Quotes list — it may show as Failed.",
};

function field(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
}

export async function createQuoteViaSite(formData: FormData) {
    const clientName = field(formData, "clientName");
    const clientEmail = field(formData, "clientEmail");
    const projectName = field(formData, "projectName");
    const projectDescription = field(formData, "projectDescription");
    const scopeSummary = field(formData, "scopeSummary");
    const totalCost = Number(field(formData, "totalCost"));
    const depositAmount = Number(field(formData, "depositAmount") || "0");
    const deliverables = field(formData, "deliverables");

    // Pre-validate the required fields locally so obvious problems
    // don't cost a site round-trip.
    if (
        !clientName ||
        !clientEmail.includes("@") ||
        !projectName ||
        !projectDescription ||
        !scopeSummary ||
        !Number.isFinite(totalCost) ||
        totalCost <= 0 ||
        depositAmount < 0 ||
        depositAmount > totalCost ||
        deliverables.length === 0
    ) {
        redirect(
            `/quotes/create?error=${encodeURIComponent(
                "Missing or invalid required fields. Client name, valid email, project name, description, scope, deliverables, and a total cost greater than zero (with deposit not exceeding it) are required.",
            )}`,
        );
    }

    const payload = {
        requestId: field(formData, "requestId") || null,
        clientName,
        clientEmail,
        businessName: field(formData, "businessName") || null,
        projectName,
        projectDescription,
        buildTier: field(formData, "buildTier"),
        projectType: field(formData, "projectType") || null,
        scopeSummary,
        timelineSummary: field(formData, "timelineSummary") || null,
        warrantySummary: field(formData, "warrantySummary") || null,
        paymentStructure: field(formData, "paymentStructure") || "PAY_IN_FULL",
        carePlanTier:
            field(formData, "carePlanTier") === "None"
                ? null
                : field(formData, "carePlanTier") || null,
        totalCost,
        depositAmount,
        monthlyPayment: Number(field(formData, "monthlyPayment") || "0") || null,
        carePlanMonthly:
            Number(field(formData, "carePlanMonthly") || "0") || null,
        deliverables,
        excludedItems: field(formData, "excludedItems"),
        estimatedStartDate: field(formData, "estimatedStartDate") || null,
        estimatedLaunchDate: field(formData, "estimatedLaunchDate") || null,
    };

    let result: CreateQuoteResponse;

    try {
        result = await siteApiFetch<CreateQuoteResponse>("/api/admin/quotes", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    } catch (error) {
        const code =
            error instanceof SiteApiError ? error.code : "unknown_error";
        const message =
            SITE_ERROR_MESSAGES[code] ??
            `Quote creation failed with an unexpected error (${code}).`;

        redirect(`/quotes/create?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/quotes");
    revalidatePath("/");
    redirect(`/quotes/${result.projectId}`);
}

/**
 * The only direct-DB quote mutation in the Command Center:
 * internal notes.
 */
export async function updateQuoteInternalNotes(id: string, formData: FormData) {
    const rawNotes = formData.get("internalNotes");
    const internalNotes =
        typeof rawNotes === "string" ? rawNotes.trim() : "";

    await prisma.clientProject.update({
        where: {
            id,
        },
        data: {
            internalNotes: internalNotes.length > 0 ? internalNotes : null,
        },
    });

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}`);
    redirect(`/quotes/${id}`);
}
