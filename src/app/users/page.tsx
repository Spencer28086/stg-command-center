import {
    CheckCircle2,
    KeyRound,
    ShieldCheck,
    Trash2,
    TriangleAlert,
    UserCog,
    Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetaItem } from "@/components/ui/MetaItem";
import { formatShortDate } from "@/lib/formatters";
import {
    deleteTestUser,
    demoteUserToStandard,
    promoteUserToAdmin,
} from "@/server/actions/users";
import {
    getUserAccounts,
    isPrivilegedKeyConfigured,
    type UserAccountItem,
} from "@/server/queries/users";

type UsersPageProps = {
    searchParams?:
        | Promise<{
              error?: string | string[];
              notice?: string | string[];
          }>
        | {
              error?: string | string[];
              notice?: string | string[];
          };
};

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const resolvedSearchParams = await searchParams;
    const error = firstValue(resolvedSearchParams?.error);
    const notice = firstValue(resolvedSearchParams?.notice);

    const { accounts, counts } = await getUserAccounts();
    const keyRequired = isPrivilegedKeyConfigured();

    return (
        <main className="space-y-6">
            <PageHeader
                title="User Accounts"
                description="Website account records, sessions, and security posture. Role changes and test-account cleanup are available below; real client accounts are protected from deletion."
            />

            {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="leading-6">{error}</p>
                </div>
            ) : null}

            {notice ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="leading-6">{notice}</p>
                </div>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatChip icon={Users} label="Total Accounts" value={counts.total} />
                <StatChip
                    icon={ShieldCheck}
                    label="Verified"
                    value={counts.verified}
                />
                <StatChip
                    icon={KeyRound}
                    label="2FA Enabled"
                    value={counts.twoFactor}
                />
                <StatChip icon={UserCog} label="Admins" value={counts.admins} />
            </section>

            <section className="space-y-4">
                {accounts.length > 0 ? (
                    accounts.map((account) => (
                        <UserCard
                            key={account.id}
                            account={account}
                            keyRequired={keyRequired}
                        />
                    ))
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-8 text-center">
                        <h2 className="text-lg font-semibold text-zinc-100">
                            No user accounts found
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Accounts will appear here as users register on the
                            STG website.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

function StatChip({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Users;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-[#d4af37]/15 bg-black/45 p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                    {label}
                </p>
                <Icon className="h-4 w-4 text-[#d4af37]/70" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {value}
            </p>
        </div>
    );
}

function UserCard({
    account,
    keyRequired,
}: {
    account: UserAccountItem;
    keyRequired: boolean;
}) {
    const displayName =
        [account.firstName, account.lastName].filter(Boolean).join(" ") ||
        account.email;

    const promoteWithId = promoteUserToAdmin.bind(null, account.id);
    const demoteWithId = demoteUserToStandard.bind(null, account.id);
    const deleteWithId = deleteTestUser.bind(null, account.id);

    return (
        <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-zinc-50">
                            {displayName}
                        </h2>

                        {account.role === "admin" ? (
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                                Admin
                            </span>
                        ) : null}

                        {account.verified ? (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                Verified
                            </span>
                        ) : (
                            <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs font-semibold text-zinc-400">
                                Unverified
                            </span>
                        )}

                        {account.twoFactorEnabled ? (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                2FA
                            </span>
                        ) : null}

                        {account.deletable ? (
                            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                                No business ties
                            </span>
                        ) : null}

                        {account.deletedAt ? (
                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                Deletion Requested
                            </span>
                        ) : null}
                    </div>

                    <p className="mt-1 text-sm text-zinc-400">
                        {account.email}
                        {account.businessName
                            ? ` · ${account.businessName}`
                            : ""}
                    </p>
                </div>

                <div className="text-sm text-zinc-500">
                    Joined {formatShortDate(account.createdAt)}
                </div>
            </div>

            <dl className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                <MetaItem
                    label="Active Sessions"
                    value={account.activeSessions}
                />
                <MetaItem label="Devices" value={account.devices} />
                <MetaItem
                    label="Subscriptions"
                    value={account.subscriptions}
                />
                <MetaItem
                    label="Agreements"
                    value={account.maintenanceAgreements}
                />
                <MetaItem label="Projects" value={account.clientProjects} />
                <MetaItem label="QR Codes" value={account.qrCodes} />
            </dl>

            <details className="group mt-5 rounded-xl border border-zinc-800 bg-black/20">
                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:text-yellow-100">
                    Manage account
                </summary>

                <div className="space-y-5 border-t border-zinc-800 p-4">
                    {/* Role management */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
                            Role
                        </h3>
                        <form
                            action={
                                account.role === "admin"
                                    ? demoteWithId
                                    : promoteWithId
                            }
                            className="mt-3 space-y-3"
                        >
                            <ConfirmFields
                                email={account.email}
                                keyRequired={keyRequired}
                            />
                            <button
                                type="submit"
                                className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/60 hover:bg-yellow-500/20"
                            >
                                {account.role === "admin"
                                    ? "Demote to standard user"
                                    : "Promote to admin"}
                            </button>
                        </form>
                    </div>

                    {/* Deletion */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-red-400/80">
                            Delete Test Account
                        </h3>

                        {account.deletable ? (
                            <form action={deleteWithId} className="mt-3 space-y-3">
                                <p className="text-sm leading-6 text-zinc-400">
                                    Permanently removes this account and its
                                    sessions, devices, download grants, and QR
                                    codes
                                    {account.supportTickets > 0
                                        ? `. ${account.supportTickets} support ticket(s) will be kept and unlinked`
                                        : ""}
                                    . This cannot be undone.
                                </p>
                                <ConfirmFields
                                    email={account.email}
                                    keyRequired={keyRequired}
                                />
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete this test account
                                </button>
                            </form>
                        ) : (
                            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                                <p className="text-sm font-medium text-zinc-300">
                                    Protected — this account has business ties
                                    and cannot be deleted from here:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-zinc-500">
                                    {account.deletionBlockers.map((blocker) => (
                                        <li key={blocker}>· {blocker}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </details>
        </article>
    );
}

function ConfirmFields({
    email,
    keyRequired,
}: {
    email: string;
    keyRequired: boolean;
}) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Type {email} to confirm
                </span>
                <input
                    type="text"
                    name="confirmEmail"
                    autoComplete="off"
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/30 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 focus:outline-none"
                    placeholder={email}
                />
            </label>

            {keyRequired ? (
                <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Privileged key
                    </span>
                    <input
                        type="password"
                        name="privilegedKey"
                        autoComplete="off"
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black/30 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-yellow-500/40 focus:outline-none"
                        placeholder="Required for this action"
                    />
                </label>
            ) : null}
        </div>
    );
}
