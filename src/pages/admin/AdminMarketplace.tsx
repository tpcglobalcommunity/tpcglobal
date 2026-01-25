import { type Language } from "@/i18n";
import { PremiumCard } from "@/components/ui";
import { ShoppingBag } from "lucide-react";

interface AdminMarketplaceProps {
  lang: Language;
}

export default function AdminMarketplace({ lang }: AdminMarketplaceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Marketplace Management</h1>
        <p className="text-gray-400">Manage marketplace listings and vendors</p>
      </div>
      
      <PremiumCard className="p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400">Marketplace management interface is under development</p>
      </PremiumCard>
    </div>
  );
}
