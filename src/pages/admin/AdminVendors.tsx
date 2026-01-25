import { type Language } from "@/i18n";
import { PremiumCard } from "@/components/ui";
import { Store } from "lucide-react";

interface AdminVendorsProps {
  lang: Language;
}

export default function AdminVendors({ lang }: AdminVendorsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Vendors Management</h1>
        <p className="text-gray-400">Review and manage vendor applications</p>
      </div>
      
      <PremiumCard className="p-12 text-center">
        <Store className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400">Vendors management interface is under development</p>
      </PremiumCard>
    </div>
  );
}
