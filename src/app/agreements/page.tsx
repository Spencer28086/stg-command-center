import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export default function Page() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Agreements"
        description="View draft, sent, pending, signed, and accepted agreements connected to STG clients and projects."
      />

      <PlaceholderPanel
        title="Agreements workspace coming soon"
        description="This module is part of the Phase 1 shell. Live data and management tools will be connected in a later phase."
      />
    </main>
  );
}
