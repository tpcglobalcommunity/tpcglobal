import { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";

interface PremiumShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const PremiumShell = ({ children, showBottomNav = true }: PremiumShellProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      {showBottomNav && <BottomNav />}
    </div>
  );
};
