import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export default function Page() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Clients"
        description="Manage client records, websites, contact details, partnership status, care plans, subscription status, referral codes, and internal notes."
      />

      <PlaceholderPanel
        title="Clients workspace coming soon"
        description="This module is part of the Phase 1 shell. Live data and management tools will be connected in a later phase."
      />
    </main>
  );
}
