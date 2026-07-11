import type { ClientAccount } from "@prisma/client";
import {
    CheckCircle2,
    ExternalLink,
    FileBadge,
    Send,
    TriangleAlert,
} from "lucide-react";
import { MetaItem } from "@/components/ui/MetaItem";
import { formatMoney } from "@/lib/formatters";
import { sendClientAccountPacket } from "@/server/actions/agreements";

export function ClientAccountPacketCard({
    agreementId,
    account,
    signed,
    error,
    notice,
}: {
    agreementId: string;
    account: ClientAccount | null;
    signed: boolean;
    error: string | null;
    notice: string | null;
}) {
    const sendWithId = sendClientAccountPacket.bind(null, agreementId);

    return (
        <>
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

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-3">
                        <FileBadge className="h-5 w-5 text-[#d4af37]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-50">
                            Client Account Packet
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Created automatically when the client signs.
                            Sending emails the PDF with a thank-you message.
                        </p>
                    </div>
                </div>

                {account ? (
                    <>
                        <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <MetaItem
                                label="Packet Number"
                                value={account.packetNumber}
                            />
                            <MetaItem
                                label="Account Number"
                                value={account.accountNumber}
                            />
                            <MetaItem
                                label="Partnership Plan"
                                value={account.partnershipPlan}
                            />
                            <MetaItem
                                label="Project Balance"
                                value={formatMoney(
                                    account.currentProjectBalance,
                                )}
                            />
                        </dl>

                        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                            {account.capUrl ? (
                                <a
                                    href={account.capUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-yellow-500/40 hover:text-yellow-100"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Packet PDF
                                </a>
                            ) : (
                                <span className="text-sm text-zinc-500">
                                    PDF will be generated when first viewed or
                                    sent.
                                </span>
                            )}

                            <form action={sendWithId}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/15 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/70 hover:bg-yellow-500/25"
                                >
                                    <Send className="h-4 w-4" />
                                    Email Packet to Client
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <p className="mt-5 rounded-xl border border-zinc-800 bg-black/20 p-4 text-sm leading-6 text-zinc-400">
                        {signed
                            ? "No client account record was found for this agreement. It is normally created at signing — check the site if this persists."
                            : "The packet does not exist yet. It will be created automatically when the client signs the agreement."}
                    </p>
                )}
            </section>
        </>
    );
}
