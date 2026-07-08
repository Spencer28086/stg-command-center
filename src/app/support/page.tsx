import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";

export default function Page() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Support Center"
        description="Manage support issues, care plan priority, ticket status, client updates, and business-critical service requests."
      />

      <PlaceholderPanel
        title="Support Center workspace coming soon"
        description="This module is part of the Phase 1 shell. Live data and management tools will be connected in a later phase."
      />
    </main>
  );
}
