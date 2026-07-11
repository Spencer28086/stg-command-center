"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    deriveReferralCode,
    findCarePlan,
    findPartnershipPlan,
    findPayInFullTier,
} from "@/lib/partnership-pricing";
import { prisma } from "@/lib/prisma";
import { SiteApiError, siteApiFetch } from "@/lib/site-api";

/**
 * Agreement creation proxies to the STG website
 * (POST /api/agreements/create), authenticated with the service key.
 * The site generates the secure signing token, emails the invitation,
 * and writes the audit trail. When the client signs, the site creates
 * the ClientAccount and CAP packet number automatically.
 *
 * Pricing derivation uses the Website Partnership Program constants
 * in lib/partnership-pricing.ts (mirroring the public pricing page).
 */

type CreateAgreementResponse = {
    ok: boolean;
    agreement: { id: string };
    signingUrl: string;
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
    invalid_body: "The site could not parse the agreement payload.",
    missing_required_fields:
        "Business name, client name, and client email are required.",
    invalid_email: "The client email address is not valid.",
    invalid_referral_code:
        "The referred-by code does not match any signed, eligible agreement.",
    self_referral:
        "A client cannot refer themselves — the code belongs to this client's own agreement.",
    agreement_create_failed:
        "The site failed while creating the agreement. Check the site logs.",
};

function field(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
}

function money(value: string): number {
    return Number.parseFloat(value.replace(/[$,\s]/g, "")) || 0;
}

export async function createAgreementViaSite(formData: FormData) {
    const clientName = field(formData, "clientName");
    const clientEmail = field(formData, "clientEmail").toLowerCase();
    const businessName = field(formData, "businessName");
    const paymentStructure = field(formData, "paymentStructure");
    const timeline = field(formData, "timeline");
    const notes = field(formData, "notes");
    const referralEligible = formData.get("referralEligible") === "on";
    const partnershipCredit = money(field(formData, "partnershipCredit"));
    const depositInput = money(field(formData, "deposit"));

    if (!clientName || !businessName || !clientEmail.includes("@")) {
        redirect(
            `/agreements/create?error=${encodeURIComponent(
                "Client name, business name, and a valid client email are required.",
            )}`,
        );
    }

    const isPartnership = paymentStructure === "Monthly Partnership";

    let projectTier: string;
    let partnershipPlan: string | null = null;
    let partnershipRate = 0;
    let projectValue = 0;
    let carePlan = "None";
    let carePlanMonthly = 0;

    if (isPartnership) {
        const plan = findPartnershipPlan(field(formData, "partnershipPlan"));

        if (!plan) {
            redirect(
                `/agreements/create?error=${encodeURIComponent(
                    "Select a partnership plan.",
                )}`,
            );
        }

        projectTier = plan.name;
        partnershipPlan = plan.name;
        partnershipRate = plan.monthlyRate;
        projectValue = plan.buildValue;
        // Partnership plans include hosting and maintenance;
        // care plans are not stacked on top.
    } else {
        const tier = findPayInFullTier(field(formData, "projectTier"));

        if (!tier) {
            redirect(
                `/agreements/create?error=${encodeURIComponent(
                    "Select a project tier.",
                )}`,
            );
        }

        projectTier = tier.name;
        projectValue = tier.price ?? money(field(formData, "customValue"));

        if (projectValue <= 0) {
            redirect(
                `/agreements/create?error=${encodeURIComponent(
                    "Enterprise agreements need a custom project value greater than zero.",
                )}`,
            );
        }

        const selectedCare = findCarePlan(field(formData, "carePlan"));
        if (selectedCare) {
            carePlan = selectedCare.name;
            carePlanMonthly = selectedCare.monthlyRate;
        }
    }

    // Monthly amount: partnership rate, or the care plan for
    // pay-in-full builds. An explicit override wins.
    const monthlyOverride = money(field(formData, "monthlyAmountOverride"));
    const monthlyAmount =
        monthlyOverride > 0
            ? monthlyOverride
            : isPartnership
              ? partnershipRate
              : carePlanMonthly;

    const payload = {
        clientName,
        clientEmail,
        businessName,
        projectTier,
        paymentStructure,
        carePlan,
        timeline: timeline || null,
        notes: notes || null,

        depositAmount: depositInput > 0 ? String(depositInput) : null,
        monthlyAmount: monthlyAmount > 0 ? String(monthlyAmount) : null,

        projectValue: projectValue > 0 ? projectValue : null,
        partnershipCredit,
        partnershipPlan,
        partnershipRate: partnershipRate > 0 ? partnershipRate : null,
        referralCode: referralEligible
            ? deriveReferralCode(businessName)
            : null,
        referredByCode: field(formData, "referredByCode") || null,
        deposit: depositInput,
        amountDueAtSigning: depositInput,
    };

    let result: CreateAgreementResponse;

    try {
        result = await siteApiFetch<CreateAgreementResponse>(
            "/api/agreements/create",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );
    } catch (error) {
        const code =
            error instanceof SiteApiError ? error.code : "unknown_error";
        const message =
            SITE_ERROR_MESSAGES[code] ??
            `Agreement creation failed with an unexpected error (${code}).`;

        redirect(`/agreements/create?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/agreements");
    revalidatePath("/");
    redirect(`/agreements/${result.agreement.id}`);
}

type SendPacketResponse = {
    ok: boolean;
    packetNumber: string;
    capUrl: string;
};

const PACKET_ERROR_MESSAGES: Record<string, string> = {
    ...SITE_ERROR_MESSAGES,
    agreement_not_found: "The agreement no longer exists on the site.",
    agreement_not_signed:
        "The agreement has not been signed yet — the Client Account Packet is created at signing.",
    account_not_found:
        "No client account exists for this agreement. It is created when the client signs.",
    email_not_configured:
        "The site's email provider (Resend) is not configured, so the packet cannot be emailed.",
    packet_send_failed:
        "The site failed while generating or emailing the packet. Check the site logs.",
};

/**
 * Emails the Client Account Packet PDF to the client with a
 * thank-you message, via the site's send-packet endpoint.
 */
export async function sendClientAccountPacket(agreementId: string) {
    let result: SendPacketResponse;

    try {
        result = await siteApiFetch<SendPacketResponse>(
            "/api/agreements/send-packet",
            {
                method: "POST",
                body: JSON.stringify({ agreementId }),
            },
        );
    } catch (error) {
        const code =
            error instanceof SiteApiError ? error.code : "unknown_error";
        const message =
            PACKET_ERROR_MESSAGES[code] ??
            `Sending the packet failed with an unexpected error (${code}).`;

        redirect(
            `/agreements/${agreementId}?error=${encodeURIComponent(message)}`,
        );
    }

    revalidatePath(`/agreements/${agreementId}`);
    redirect(
        `/agreements/${agreementId}?notice=${encodeURIComponent(
            `Packet ${result.packetNumber} emailed to the client with the thank-you message.`,
        )}`,
    );
}

export async function updateAgreementInternalNotes(
  id: string,
  formData: FormData,
) {
  const rawNotes = formData.get("internalNotes");
  const internalNotes = typeof rawNotes === "string" ? rawNotes.trim() : "";

  await prisma.maintenanceAgreement.update({
    where: {
      id,
    },
    data: {
      internalNotes: internalNotes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/agreements");
  revalidatePath(`/agreements/${id}`);
  revalidatePath("/clients");
  redirect(`/agreements/${id}`);
}
