import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export default function Page() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Subscriptions"
        description="Track website partnerships, care plans, desktop software subscriptions, subscription status, billing intervals, and monthly recurring revenue."
      />

      <PlaceholderPanel
        title="Subscriptions workspace coming soon"
        description="This module is part of the Phase 1 shell. Live data and management tools will be connected in a later phase."
      />
    </main>
  );
}
