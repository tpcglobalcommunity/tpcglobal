import { type Language } from "@/i18n";
import { PremiumCard } from "@/components/ui";
import { Settings } from "lucide-react";

interface AdminSettingsProps {
  lang: Language;
}

export default function AdminSettings({ lang }: AdminSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure system settings and preferences</p>
      </div>
      
      <PremiumCard className="p-12 text-center">
        <Settings className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400">Settings interface is under development</p>
      </PremiumCard>
    </div>
  );
}
