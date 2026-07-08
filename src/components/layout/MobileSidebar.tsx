"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/components/layout/nav-items";

function isActivePath(pathname: string, href: string) {
    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="lg:hidden">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] p-3 text-[#d4af37] transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10"
                aria-label="Open navigation menu"
            >
                <Menu className="h-4 w-4" />
            </button>

            {open ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        aria-label="Close navigation overlay"
                    />

                    <aside className="relative z-10 flex h-full w-[86%] max-w-sm flex-col border-r border-[#d4af37]/20 bg-[#050505] px-5 py-6 shadow-2xl shadow-black">
                        <div className="flex items-center justify-between gap-4">
                            <Link
                                href="/"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-[#d4af37]/10">
                                    <Shield className="h-5 w-5 text-[#d4af37]" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                                        STG
                                    </p>
                                    <p className="text-sm text-stone-400">Command Center</p>
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-2xl border border-[#d4af37]/20 bg-white/[0.03] p-3 text-stone-300 transition hover:border-[#d4af37]/40 hover:text-[#f5d77b]"
                                aria-label="Close navigation menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="mt-10 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActivePath(pathname, item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={[
                                            "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                            active
                                                ? "border-[#d4af37]/35 bg-[#d4af37]/12 text-[#f5d77b]"
                                                : "border-transparent text-stone-400 hover:border-[#d4af37]/25 hover:bg-[#d4af37]/10 hover:text-[#f5d77b]",
                                        ].join(" ")}
                                    >
                                        <Icon
                                            className={[
                                                "h-4 w-4 transition",
                                                active
                                                    ? "text-[#d4af37]"
                                                    : "text-stone-500 group-hover:text-[#d4af37]",
                                            ].join(" ")}
                                        />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto rounded-3xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f5d77b]">
                                Owner Mode
                            </p>
                            <p className="mt-3 text-sm leading-6 text-stone-300">
                                Private STG operations access.
                            </p>
                        </div>
                    </aside>
                </div>
            ) : null}
        </div>
    );
}