/**
 * Lead scoring for SystemRequest records.
 *
 * This is a direct port of the scoring logic in the STG website's
 * /api/admin/leads route. Keep the two in sync — the Command Center
 * and the site admin must always agree on a lead's score and tier.
 */

export type LeadTier = "high" | "medium" | "low";

export type LeadScore = {
    score: number;
    tier: LeadTier;
};

type ScorableLead = {
    budget?: string | null;
    type?: string | null;
    details?: string | null;
};

export function scoreLead(lead: ScorableLead): LeadScore {
    let score = 0;

    if (lead.budget === "$3,000+") score += 40;
    else if (lead.budget === "$1,000 - $3,000") score += 25;
    else if (lead.budget === "$500 - $1,000") score += 10;

    if (lead.type?.includes("Full Business")) score += 30;
    if (lead.type?.includes("Automation")) score += 20;

    const detailsLength = lead.details?.length ?? 0;

    if (detailsLength > 120) score += 20;
    else if (detailsLength > 60) score += 10;

    let tier: LeadTier = "low";
    if (score >= 70) tier = "high";
    else if (score >= 40) tier = "medium";

    return { score, tier };
}
