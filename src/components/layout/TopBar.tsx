import { Bell, CircleUserRound, Search } from "lucide-react";
import Link from "next/link";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

export function TopBar() {
    return (
        <header className="sticky top-0 z-20 border-b border-[#d4af37]/15 bg-black/55 px-5 py-4 backdrop-blur-xl md:px-8 lg:px-10">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <MobileSidebar />

                    <Link
                        href="/search"
                        className="hidden items-center gap-3 rounded-2xl border border-[#d4af37]/15 bg-white/[0.03] px-4 py-2 text-sm text-stone-400 transition hover:border-[#d4af37]/35 hover:text-[#f5d77b] md:flex"
                    >
                        <Search className="h-4 w-4 text-[#d4af37]" />
                        <span>Search clients, requests, agreements...</span>
                    </Link>

                    <div className="md:hidden">
                        <p className="text-sm font-semibold text-white">
                            STG Command Center
                        </p>
                        <p className="text-xs text-stone-500">Private Operations</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/notifications"
                        className="relative rounded-2xl border border-[#d4af37]/15 bg-white/[0.03] p-3 text-stone-300 transition hover:border-[#d4af37]/35 hover:text-[#f5d77b]"
                        aria-label="Open notifications"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d4af37]" />
                    </Link>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#d4af37]/15 bg-white/[0.03] px-3 py-2">
                        <CircleUserRound className="h-5 w-5 text-[#d4af37]" />
                        <div className="hidden sm:block">
                            <p className="text-xs font-medium text-white">Donald</p>
                            <p className="text-[11px] text-stone-500">Owner Access</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
