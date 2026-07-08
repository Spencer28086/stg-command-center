// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CommandShell } from "@/components/layout/CommandShell";

export const metadata: Metadata = {
  title: "STG Command Center",
  description: "Private operations command center for Spencer Technology Group.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CommandShell>{children}</CommandShell>
      </body>
    </html>
  );
}
