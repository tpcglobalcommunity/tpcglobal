import { Link } from "@/components/Router";
import { getLangPath, getLanguage } from "@/i18n";

export default function NotFound() {
  const lang = getLanguage();
  
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>404</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>Halaman tidak ditemukan.</p>
      <div style={{ marginTop: 16 }}>
        <Link to={getLangPath(lang, '/home')}>Kembali</Link>
      </div>
    </div>
  );
}
