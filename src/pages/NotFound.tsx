import { Link } from "../components/Router";

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>404</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>Halaman tidak ditemukan.</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/">Kembali</Link>
      </div>
    </div>
  );
}
