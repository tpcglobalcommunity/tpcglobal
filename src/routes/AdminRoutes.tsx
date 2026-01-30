import { Routes, Route } from "react-router-dom";
import { RequireAdmin } from "@/components/guards/RequireAdmin";
import { AdminLayout } from "@/layouts/AdminLayout";
import ComingSoonPage from "@/pages/public/ComingSoonPage";

// Admin Pages
const AdminDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <p className="text-gray-600">Manage the platform from here.</p>
  </div>
);

const AdminSettings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
    <p className="text-gray-600">Configure system settings.</p>
  </div>
);

export const AdminRoutes = () => (
  <Route path="/admin" element={
    <RequireAdmin>
      <AdminLayout />
    </RequireAdmin>
  }>
    <Route index element={<AdminDashboard />} />
    <Route path="invoices" element={<div>Admin Invoices (Coming Soon)</div>} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="*" element={<ComingSoonPage titleKey="admin.settingsTitle" />} />
  </Route>
);
