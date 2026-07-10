import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { createQuoteViaSite } from "@/server/actions/quotes";

export const dynamic = "force-dynamic";

/**
 * Defaults mirror the site's admin quote form exactly, so quotes
 * created from either surface come out identical.
 */
const DEFAULT_DELIVERABLES = [
    "Custom design aligned with the client's brand",
    "Responsive mobile and desktop development",
    "Core page content setup",
    "Contact and lead capture forms",
    "SEO foundation and performance optimization",
    "Domain, hosting, and launch configuration",
    "One custom branded QR code (static or dynamic selected at agreement signing)",
].join("\n");

const DEFAULT_EXCLUSIONS = [
    "Third-party subscriptions, licenses, domain, and hosting fees unless listed as included",
    "Paid advertising, copywriting, photography, and premium stock assets",
    "Features or integrations outside the approved scope",
].join("\n");

const DEFAULT_TIMELINE =
    "4-8 weeks after content, access, and approvals are received";

const DEFAULT_WARRANTY =
    "A 30-day workmanship warranty begins at launch. Ongoing maintenance and updates require an active care plan.";

const BUILD_TIERS = [
    "Starter",
    "Professional",
    "Creative Business",
    "Enterprise",
];

const CARE_PLANS = ["None", "Basic Care Plan", "Premium Care Plan"];

type CreateQuotePageProps = {
    searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function firstValue(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

export default async function CreateQuotePage({
    searchParams,
}: CreateQuotePageProps) {
    const resolved = await searchParams;
    const error = firstValue(resolved?.error);

    // Prefill support: /quotes/create?requestId=...&name=...&email=...&business=...
    const requestId = firstValue(resolved?.requestId);
    const prefillName = firstValue(resolved?.name);
    const prefillEmail = firstValue(resolved?.email);
    const prefillBusiness = firstValue(resolved?.business);

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <Link
                    href="/quotes"
                    className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                >
                    ← Back to Quotes
                </Link>

                <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                    Spencer Technology Group
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                    Create Quote
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Submitting this form sends the quote through the STG
                    website pipeline: the PDF is generated, stored, and emailed
                    to the client immediately. There is no separate draft step.
                </p>
            </section>

            {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="leading-6">{error}</p>
                </div>
            ) : null}

            <form action={createQuoteViaSite} className="space-y-6">
                {requestId ? (
                    <input type="hidden" name="requestId" value={requestId} />
                ) : null}

                <Section title="Client">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Client Name *"
                            name="clientName"
                            defaultValue={prefillName}
                            placeholder="Jane Smith"
                        />
                        <Field
                            label="Client Email *"
                            name="clientEmail"
                            type="email"
                            defaultValue={prefillEmail}
                            placeholder="jane@example.com"
                        />
                        <Field
                            label="Business Name"
                            name="businessName"
                            defaultValue={prefillBusiness}
                            placeholder="Smith & Co."
                        />
                    </div>
                </Section>

                <Section title="Project">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Project Name *"
                            name="projectName"
                            defaultValue={
                                prefillBusiness
                                    ? `${prefillBusiness} Website Build`
                                    : "Custom Website Build"
                            }
                        />
                        <Field
                            label="Project Type"
                            name="projectType"
                            defaultValue="Custom Website Build"
                        />
                        <SelectField
                            label="Build Tier *"
                            name="buildTier"
                            options={BUILD_TIERS}
                            defaultValue="Professional Website"
                        />
                    </div>
                    <TextareaField
                        label="Project Description *"
                        name="projectDescription"
                        rows={3}
                        placeholder="What is being built and why."
                    />
                    <TextareaField
                        label="Scope Summary *"
                        name="scopeSummary"
                        rows={3}
                        placeholder="What is included in the scope of this project."
                    />
                </Section>

                <Section title="Pricing">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field
                            label="Total Cost (USD) *"
                            name="totalCost"
                            type="number"
                            placeholder="3000"
                        />
                        <Field
                            label="Deposit (USD)"
                            name="depositAmount"
                            type="number"
                            placeholder="0"
                        />
                        <SelectField
                            label="Payment Structure"
                            name="paymentStructure"
                            options={["PAY_IN_FULL", "MONTHLY_PARTNERSHIP"]}
                            optionLabels={{
                                PAY_IN_FULL: "Pay in Full",
                                MONTHLY_PARTNERSHIP: "Monthly Partnership",
                            }}
                            defaultValue="PAY_IN_FULL"
                        />
                        <Field
                            label="Monthly Payment (USD)"
                            name="monthlyPayment"
                            type="number"
                            placeholder="Only for partnerships"
                        />
                        <SelectField
                            label="Care Plan"
                            name="carePlanTier"
                            options={CARE_PLANS}
                            defaultValue="None"
                        />
                        <Field
                            label="Care Plan Monthly (USD)"
                            name="carePlanMonthly"
                            type="number"
                            placeholder="Only with a care plan"
                        />
                    </div>
                </Section>

                <Section title="Timeline & Warranty">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Estimated Start Date"
                            name="estimatedStartDate"
                            type="date"
                        />
                        <Field
                            label="Estimated Launch Date"
                            name="estimatedLaunchDate"
                            type="date"
                        />
                    </div>
                    <TextareaField
                        label="Timeline Summary"
                        name="timelineSummary"
                        rows={2}
                        defaultValue={DEFAULT_TIMELINE}
                    />
                    <TextareaField
                        label="Warranty Summary"
                        name="warrantySummary"
                        rows={2}
                        defaultValue={DEFAULT_WARRANTY}
                    />
                </Section>

                <Section title="Deliverables & Exclusions">
                    <TextareaField
                        label="Deliverables (one per line) *"
                        name="deliverables"
                        rows={8}
                        defaultValue={DEFAULT_DELIVERABLES}
                    />
                    <TextareaField
                        label="Excluded Items (one per line)"
                        name="excludedItems"
                        rows={4}
                        defaultValue={DEFAULT_EXCLUSIONS}
                    />
                </Section>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/quotes"
                        className="rounded-full border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
                    >
                        Generate & Send Quote
                    </button>
                </div>
            </form>
        </main>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
            {children}
        </section>
    );
}

const inputClassName =
    "mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/30 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 focus:outline-none";

function Field({
    label,
    name,
    type = "text",
    defaultValue,
    placeholder,
}: {
    label: string;
    name: string;
    type?: string;
    defaultValue?: string;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </span>
            <input
                type={type}
                name={name}
                defaultValue={defaultValue}
                placeholder={placeholder}
                min={type === "number" ? 0 : undefined}
                className={inputClassName}
            />
        </label>
    );
}

function SelectField({
    label,
    name,
    options,
    optionLabels,
    defaultValue,
}: {
    label: string;
    name: string;
    options: string[];
    optionLabels?: Record<string, string>;
    defaultValue?: string;
}) {
    return (
        <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </span>
            <select
                name={name}
                defaultValue={defaultValue}
                className={inputClassName}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {optionLabels?.[option] ?? option}
                    </option>
                ))}
            </select>
        </label>
    );
}

function TextareaField({
    label,
    name,
    rows,
    defaultValue,
    placeholder,
}: {
    label: string;
    name: string;
    rows: number;
    defaultValue?: string;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </span>
            <textarea
                name={name}
                rows={rows}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className={`${inputClassName} leading-6`}
            />
        </label>
    );
}
