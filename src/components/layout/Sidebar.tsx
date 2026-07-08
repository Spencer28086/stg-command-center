"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { navItems } from "@/components/layout/nav-items";

function isActivePath(pathname: string, href: string) {
    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-72 shrink-0 border-r border-[#d4af37]/15 bg-black/60 px-5 py-6 backdrop-blur-xl lg:block">
            <Link href="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/35 bg-[#d4af37]/10 shadow-[0_0_32px_rgba(212,175,55,0.12)]">
                    <Shield className="h-6 w-6 text-[#d4af37]" />
                </div>

                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                        STG
                    </p>
                    <p className="text-sm text-stone-400">Command Center</p>
                </div>
            </Link>

            <nav className="mt-10 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(pathname, item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={[
                                "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                                active
                                    ? "border-[#d4af37]/35 bg-[#d4af37]/12 text-[#f5d77b] shadow-[0_0_26px_rgba(212,175,55,0.08)]"
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

            <div className="mt-10 rounded-3xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f5d77b]">
                    Owner Mode
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                    Private operations access for Spencer Technology Group.
                </p>
            </div>
        </aside>
    );
}