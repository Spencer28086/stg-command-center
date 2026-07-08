import type { LucideIcon } from "lucide-react";
import {
    Bell,
    ClipboardList,
    FileSignature,
    Headphones,
    LayoutDashboard,
    Settings,
    Users,
    WalletCards,
} from "lucide-react";

export type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
};

export const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Requests", href: "/requests", icon: ClipboardList },
    { label: "Subscriptions", href: "/subscriptions", icon: WalletCards },
    { label: "Agreements", href: "/agreements", icon: FileSignature },
    { label: "Support", href: "/support", icon: Headphones },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
];