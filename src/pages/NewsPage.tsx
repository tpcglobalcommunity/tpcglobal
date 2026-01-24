import { useI18n } from "@/i18n";

export default function NewsPage() {
  const { t } = useI18n();

  return (
    <div style={{ padding: 24 }}>
      <h1>{t("app.name")}</h1>
      <p>News page will be rebuilt.</p>
    </div>
  );
}
