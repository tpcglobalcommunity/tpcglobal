import { Outlet } from "react-router-dom";
import { MemberHeader } from "../components/nav/MemberHeader";
import { MemberBottomNav } from "../components/nav/MemberBottomNav";

interface MemberLayoutProps {
  children?: React.ReactNode;
}

export const MemberLayout = ({ children }: MemberLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <MemberHeader />
      <main className="flex-1 pb-20 lg:pb-0">
        {children || <Outlet />}
      </main>
      <MemberBottomNav />
    </div>
  );
};
