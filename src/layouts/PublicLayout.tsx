import { Outlet } from "react-router-dom";
import { PublicHeader } from "../components/layout/PublicHeader";
import { PublicBottomNav } from "../components/nav/PublicBottomNav";

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 pb-20 lg:pb-0">
        {children || <Outlet />}
      </main>
      <PublicBottomNav />
    </div>
  );
};
