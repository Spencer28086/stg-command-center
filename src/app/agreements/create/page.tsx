import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import {
    CARE_PLANS,
    PARTNERSHIP_PLANS,
    PAY_IN_FULL_TIERS,
} from "@/lib/partnership-pricing";
import { createAgreementViaSite } from "@/server/actions/agreements";

export const dynamic = "force-dynamic";

type CreateAgreementPageProps = {
    searchParams?:
        | Promise<Record<string, string | string[] | undefined>>
        | Record<string, string | string[] | undefined>;
};

function firstValue(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

export default async function CreateAgreementPage({
    searchParams,
}: CreateAgreementPageProps) {
    const resolved = await searchParams;
    const error = firstValue(resolved?.error);

    // Prefill: /agreements/create?name=...&email=...&business=...
    const prefillName = firstValue(resolved?.name);
    const prefillEmail = firstValue(resolved?.email);
    const prefillBusiness = firstValue(resolved?.business);

    return (
        <main className="space-y-6">
            <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
                <Link
                    href="/agreements"
                    className="text-sm font-semibold text-yellow-500/80 transition hover:text-yellow-300"
                >
                    ← Back to Agreements
                </Link>

                <p className="mt-5 text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
                    Website Partnership Program
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                    Create Agreement
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Submitting emails the client a secure signing link
                    immediately. When they sign, their Client Account and
                    Client Account Packet (CAP) are created automatically.
                </p>
            </section>

            {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="leading-6">{error}</p>
                </div>
            ) : null}

            <form action={createAgreementViaSite} className="space-y-6">
                <Section title="Client">
                    <div className="grid gap-4 md:grid-cols-3">
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
                            label="Business Name *"
                            name="businessName"
                            defaultValue={prefillBusiness}
                            placeholder="Smith & Co."
                        />
                        <Field
                            label="Referred By Code (optional)"
                            name="referredByCode"
                            placeholder="e.g. TESTBUSINESS"
                        />
                    </div>
                </Section>

                <Section title="Structure & Pricing">
                    <SelectField
                        label="Payment Structure"
                        name="paymentStructure"
                        options={["Monthly Partnership", "Pay-In-Full"]}
                        defaultValue="Monthly Partnership"
                    />

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-yellow-500/20 bg-black/20 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                                Partnership Plan
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                Used when payment structure is Monthly
                                Partnership. Rate and build value fill in
                                automatically. Hosting and maintenance are
                                included — no care plan is added on top.
                            </p>
                            <div className="mt-3 space-y-2">
                                {PARTNERSHIP_PLANS.map((plan, index) => (
                                    <label
                                        key={plan.name}
                                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 transition hover:border-yellow-500/30"
                                    >
                                        <input
                                            type="radio"
                                            name="partnershipPlan"
                                            value={plan.name}
                                            defaultChecked={index === 1}
                                            className="mt-1 accent-yellow-500"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold text-zinc-100">
                                                {plan.name} — ${plan.monthlyRate}
                                                /mo
                                            </span>
                                            <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                                                ${plan.buildValue.toLocaleString()}{" "}
                                                build value ·{" "}
                                                {plan.minimumTermMonths}-month
                                                minimum · {plan.summary}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Pay-In-Full
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                Used when payment structure is Pay-In-Full.
                                Care plans are optional monthly add-ons for
                                paid-outright builds.
                            </p>
                            <div className="mt-3 space-y-4">
                                <SelectField
                                    label="Project Tier"
                                    name="projectTier"
                                    options={PAY_IN_FULL_TIERS.map(
                                        (tier) =>
                                            tier.name,
                                    )}
                                    optionLabels={Object.fromEntries(
                                        PAY_IN_FULL_TIERS.map((tier) => [
                                            tier.name,
                                            tier.price
                                                ? `${tier.name} — $${tier.price.toLocaleString()}`
                                                : `${tier.name} — Custom`,
                                        ]),
                                    )}
                                    defaultValue="Professional Website"
                                />
                                <Field
                                    label="Custom Value (Enterprise only, USD)"
                                    name="customValue"
                                    type="number"
                                    placeholder="Only for Enterprise Solution"
                                />
                                <SelectField
                                    label="Care Plan"
                                    name="carePlan"
                                    options={[
                                        "None",
                                        ...CARE_PLANS.map((plan) => plan.name),
                                    ]}
                                    optionLabels={Object.fromEntries(
                                        CARE_PLANS.map((plan) => [
                                            plan.name,
                                            `${plan.name} — $${plan.monthlyRate}/mo`,
                                        ]),
                                    )}
                                    defaultValue="None"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Field
                            label="Partnership Credit / Discount (USD)"
                            name="partnershipCredit"
                            type="number"
                            placeholder="0"
                        />
                        <Field
                            label="Deposit (USD, 0 = waived)"
                            name="deposit"
                            type="number"
                            placeholder="0"
                        />
                        <Field
                            label="Monthly Amount Override (USD)"
                            name="monthlyAmountOverride"
                            type="number"
                            placeholder="Leave blank to use plan rate"
                        />
                    </div>
                </Section>

                <Section title="Terms & Notes">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Timeline"
                            name="timeline"
                            placeholder="e.g. 4-8 weeks after content and approvals"
                        />
                        <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/20 px-4 py-3">
                            <input
                                type="checkbox"
                                name="referralEligible"
                                defaultChecked
                                className="h-4 w-4 accent-yellow-500"
                            />
                            <span className="text-sm text-zinc-300">
                                Referral eligible (code derived from business
                                name)
                            </span>
                        </label>
                    </div>
                    <TextareaField
                        label="Internal Notes"
                        name="notes"
                        rows={3}
                        placeholder="Private notes — never shown to the client."
                    />
                </Section>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/agreements"
                        className="rounded-full border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
                    >
                        Create & Send Signing Link
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
                step={type === "number" ? "0.01" : undefined}
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
    placeholder,
}: {
    label: string;
    name: string;
    rows: number;
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
                placeholder={placeholder}
                className={`${inputClassName} leading-6`}
            />
        </label>
    );
}
