/**
 * Website Partnership Program pricing.
 *
 * MIRRORS the STG website's public pricing page (app/pricing/page.tsx).
 * If pricing changes on the site, update this file to match — the
 * Command Center's agreement form derives rates from these constants.
 */

export type PartnershipPlan = {
    /** Stored in MaintenanceAgreement.partnershipPlan / projectTier */
    name: string;
    monthlyRate: number;
    /** Build value of the included website (projectValue) */
    buildValue: number;
    minimumTermMonths: number;
    summary: string;
};

export const PARTNERSHIP_PLANS: PartnershipPlan[] = [
    {
        name: "Starter Partnership",
        monthlyRate: 99,
        buildValue: 1000,
        minimumTermMonths: 12,
        summary:
            "Custom Starter website included · hosting, SSL, maintenance, standard support",
    },
    {
        name: "Professional Partnership",
        monthlyRate: 179,
        buildValue: 2500,
        minimumTermMonths: 12,
        summary:
            "Custom Professional website included · one integration, priority support, SEO setup",
    },
    {
        name: "Creative Business Partnership",
        monthlyRate: 299,
        buildValue: 5000,
        minimumTermMonths: 12,
        summary:
            "Full Creative Business infrastructure · multiple integrations, same-day support, advanced SEO",
    },
];

export type PayInFullTier = {
    name: string;
    price: number | null; // null = custom quote
};

export const PAY_IN_FULL_TIERS: PayInFullTier[] = [
    { name: "Starter Website", price: 1000 },
    { name: "Professional Website", price: 2500 },
    { name: "Creative Business Website", price: 5000 },
    { name: "Enterprise Solution", price: null },
];

export type CarePlan = {
    name: string;
    monthlyRate: number;
};

/**
 * Care plans apply to pay-in-full builds. Partnership plans already
 * include hosting and maintenance, so care plans are not added on
 * top of a partnership.
 */
export const CARE_PLANS: CarePlan[] = [
    { name: "Basic Care Plan", monthlyRate: 75 },
    { name: "Premium Care Plan", monthlyRate: 150 },
];

export function findPartnershipPlan(name: string): PartnershipPlan | null {
    return PARTNERSHIP_PLANS.find((plan) => plan.name === name) ?? null;
}

export function findPayInFullTier(name: string): PayInFullTier | null {
    return PAY_IN_FULL_TIERS.find((tier) => tier.name === name) ?? null;
}

export function findCarePlan(name: string): CarePlan | null {
    return CARE_PLANS.find((plan) => plan.name === name) ?? null;
}

/** Same referral code derivation the site's admin form uses. */
export function deriveReferralCode(businessName: string): string {
    return businessName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}
