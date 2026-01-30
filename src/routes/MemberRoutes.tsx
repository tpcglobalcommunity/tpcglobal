import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { MemberLayout } from "@/layouts/MemberLayout";
import ComingSoonPage from "@/pages/public/ComingSoonPage";

// Member Pages (placeholder pages for now)
const MemberDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
    <p className="text-gray-600">Welcome to your member dashboard.</p>
  </div>
);

const MemberInvoices = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">My Invoices</h1>
    <p className="text-gray-600">View and manage your invoices.</p>
  </div>
);

const MemberReferral = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Referral Program</h1>
    <p className="text-gray-600">Invite friends and earn rewards.</p>
  </div>
);

const MemberProfile = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">My Profile</h1>
    <p className="text-gray-600">Manage your account settings.</p>
  </div>
);

export const MemberRoutes = () => (
  <Route path="/member" element={
    <RequireAuth>
      <MemberLayout />
    </RequireAuth>
  }>
    <Route index element={<MemberDashboard />} />
    <Route path="invoices" element={<MemberInvoices />} />
    <Route path="referral" element={<MemberReferral />} />
    <Route path="profile" element={<MemberProfile />} />
    <Route path="*" element={<ComingSoonPage titleKey="comingSoonPages.member" />} />
  </Route>
);
