import { useAuth } from "../../contexts/AuthContext";
import { hasTier, TpcTier } from "../../lib/tier";
import { NoticeBox } from "../ui";
import type { ReactNode } from "react";

export default function TierGate({
  required,
  children,
}: {
  required: TpcTier;
  children: React.ReactNode;
}) {
  const { profile } = useAuth();

  const ok = hasTier(profile?.tpc_tier, required);

  if (!ok) {
    return (
      <NoticeBox variant="info">
        Fitur ini membutuhkan tier <b>{required}</b>. Hubungkan wallet dan pastikan holding TPC mencukupi.
      </NoticeBox>
    );
  }

  return <>{children}</>;
}
