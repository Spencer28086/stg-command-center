import type { LucideIcon } from "lucide-react";
import {
    Activity,
    Bell,
    ClipboardList,
    FileSignature,
    Headphones,
    LayoutDashboard,
    Mails,
    MessageSquareQuote,
    Search,
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
    { label: "Search", href: "/search", icon: Search },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Requests", href: "/requests", icon: ClipboardList },
    { label: "Subscriptions", href: "/subscriptions", icon: WalletCards },
    { label: "Agreements", href: "/agreements", icon: FileSignature },
    { label: "Support", href: "/support", icon: Headphones },
    { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote },
    { label: "Waitlist", href: "/waitlist", icon: Mails },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Site Health", href: "/health", icon: Activity },
    { label: "Settings", href: "/settings", icon: Settings },
];
