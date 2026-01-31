import { Outlet } from "react-router-dom";
import { AdminHeader } from "../components/nav/AdminHeader";
import { AdminBottomNav } from "../components/nav/AdminBottomNav";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B0F17' }}>
      <AdminHeader />
      <main className="flex-1 pb-20 lg:pb-0">
        {children || <Outlet />}
      </main>
      <AdminBottomNav />
    </div>
  );
};
