import { BadgeCheck, Quote, Undo2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/formatters";
import {
    approveTestimonial,
    revokeTestimonialApproval,
} from "@/server/actions/testimonials";
import {
    getTestimonials,
    normalizeTestimonialFilter,
    type TestimonialItem,
} from "@/server/queries/testimonials";

type TestimonialsPageProps = {
    searchParams?:
        | Promise<{
              status?: string | string[];
          }>
        | {
              status?: string | string[];
          };
};

export const dynamic = "force-dynamic";

export default async function TestimonialsPage({
    searchParams,
}: TestimonialsPageProps) {
    const resolvedSearchParams = await searchParams;
    const activeFilter = normalizeTestimonialFilter(
        resolvedSearchParams?.status,
    );
    const { testimonials, counts } = await getTestimonials(activeFilter);

    return (
        <main className="space-y-6">
            <PageHeader
                title="Testimonials"
                description="Review and approve client testimonials before they appear on STG case study pages. Approval controls public visibility."
            />

            <section className="flex flex-wrap gap-3">
                <FilterLink
                    href="/testimonials"
                    label="All"
                    count={counts.all}
                    active={activeFilter === "all"}
                />
                <FilterLink
                    href="/testimonials?status=pending"
                    label="Pending Review"
                    count={counts.pending}
                    active={activeFilter === "pending"}
                />
                <FilterLink
                    href="/testimonials?status=approved"
                    label="Approved"
                    count={counts.approved}
                    active={activeFilter === "approved"}
                />
            </section>

            <section className="space-y-4">
                {testimonials.length > 0 ? (
                    testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                        />
                    ))
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                        <h2 className="text-lg font-semibold text-zinc-100">
                            No testimonials found
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            This filter does not currently have any matching
                            testimonial records.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

function FilterLink({
    href,
    label,
    count,
    active,
}: {
    href: string;
    label: string;
    count: number;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            className={
                active
                    ? "rounded-full border border-yellow-500/50 bg-yellow-500/15 px-4 py-2 text-sm font-semibold text-yellow-100 shadow-sm shadow-yellow-950/40"
                    : "rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-yellow-500/30 hover:text-yellow-100"
            }
        >
            {label}
            <span className="ml-2 rounded-full bg-black/30 px-2 py-0.5 text-xs">
                {count}
            </span>
        </Link>
    );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
    const approveWithId = approveTestimonial.bind(null, testimonial.id);
    const revokeWithId = revokeTestimonialApproval.bind(null, testimonial.id);

    return (
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-zinc-50">
                            {testimonial.name}
                        </h2>

                        {testimonial.approved ? (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                Approved · Public
                            </span>
                        ) : (
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                                Pending Review
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-zinc-400">
                        {testimonial.role} · {testimonial.project}
                    </p>
                </div>

                <div className="text-sm text-zinc-500">
                    Submitted {formatDate(testimonial.createdAt)}
                </div>
            </div>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4">
                <div className="flex gap-3">
                    <Quote className="h-5 w-5 shrink-0 text-yellow-500/70" />
                    <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                        {testimonial.quote}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                {testimonial.approved ? (
                    <form action={revokeWithId}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-yellow-500/40 hover:text-yellow-100"
                        >
                            <Undo2 className="h-4 w-4" />
                            Revoke approval
                        </button>
                    </form>
                ) : (
                    <form action={approveWithId}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
                        >
                            <BadgeCheck className="h-4 w-4" />
                            Approve for public display
                        </button>
                    </form>
                )}
            </div>
        </article>
    );
}
