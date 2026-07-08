import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderPanel } from "@/components/layout/PlaceholderPanel";
import { DatabaseStatusCard } from "@/components/settings/DatabaseStatusCard";

export default function SettingsPage() {
  return (
    <main className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage API connection settings, notification preferences, private app behavior, and future desktop options."
      />

      <DatabaseStatusCard />

      <PlaceholderPanel
        title="Command Center settings coming soon"
        description="Future settings will include notification preferences, desktop badge behavior, API sync options, and owner-only security controls."
      />
    </main>
  );
}