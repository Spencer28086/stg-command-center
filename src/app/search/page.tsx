import Link from "next/link";
import { Search } from "lucide-react";
import {
  getSearchTerm,
  searchCommandCenter,
  type SearchResultItem,
} from "@/server/queries/search";

type SearchPageProps = {
  searchParams?:
  | Promise<{
    q?: string | string[];
  }>
  | {
    q?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = getSearchTerm(resolvedSearchParams?.q);
  const results = await searchCommandCenter(resolvedSearchParams?.q);
  const totalResults =
    results.requests.length +
    results.agreements.length +
    results.clients.length +
    results.supportTickets.length +
    results.subscriptions.length;

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-yellow-500/20 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-500/80">
          Spencer Technology Group
        </p>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Global Search
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Search read-only operational records by client, business, email,
              status, subject, plan, or record ID.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
            <span className="font-semibold">{totalResults}</span>{" "}
            result{totalResults === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <form
        action="/search"
        className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-lg shadow-black/20"
      >
        <label
          htmlFor="q"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500"
        >
          Search
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500/70" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={searchTerm}
              placeholder="Name, business, email, subject, plan, status, or ID"
              className="h-12 w-full rounded-xl border border-zinc-800 bg-black/30 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:bg-black/40"
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
          >
            Search
          </button>
        </div>
      </form>

      {searchTerm.length === 0 ? (
        <EmptyState
          title="Search the command center"
          description="Enter at least two characters to search requests, agreements, clients, support tickets, and subscriptions."
        />
      ) : searchTerm.length < 2 ? (
        <EmptyState
          title="Keep typing"
          description="Search needs at least two characters before querying the database."
        />
      ) : totalResults === 0 ? (
        <EmptyState
          title="No matches found"
          description="No read-only command center records matched that search."
        />
      ) : (
        <section className="space-y-5">
          <SearchResultGroup title="Requests" items={results.requests} />
          <SearchResultGroup title="Agreements" items={results.agreements} />
          <SearchResultGroup
            title="Clients"
            items={results.clients}
            note="Signed maintenance agreements only"
          />
          <SearchResultGroup
            title="Support Tickets"
            items={results.supportTickets}
          />
          <SearchResultGroup
            title="Subscriptions"
            items={results.subscriptions}
          />
        </section>
      )}
    </main>
  );
}

function SearchResultGroup({
  title,
  items,
  note,
}: {
  title: string;
  items: SearchResultItem[];
  note?: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
          {note ? <p className="mt-1 text-sm text-zinc-500">{note}</p> : null}
        </div>
        <span className="w-fit rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-100">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-black/20">
          {items.map((item) => (
            <Link
              key={`${title}-${item.id}`}
              href={item.href}
              className="block p-4 transition hover:bg-yellow-500/5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-zinc-100">
                    {item.title}
                  </p>
                  <p className="mt-1 break-words text-sm leading-6 text-zinc-400">
                    {item.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                  <span>{item.label}</span>
                  <span>·</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-black/20 p-4 text-sm text-zinc-500">
          No matches in this section.
        </p>
      )}
    </section>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
