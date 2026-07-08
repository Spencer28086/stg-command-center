import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export default function Page() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Review new requests, new subscribers, failed payments, unsigned agreements, open support items, and other business alerts."
      />

      <PlaceholderPanel
        title="Notifications workspace coming soon"
        description="This module is part of the Phase 1 shell. Live data and management tools will be connected in a later phase."
      />
    </main>
  );
}
