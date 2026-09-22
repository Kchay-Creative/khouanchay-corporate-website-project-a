import Link from "next/link";
export default function NotFound() {
  return (
    <main className="status-page">
      <div className="status-card">
        <span className="status-code">404</span>
        <h1>Page Not Found</h1>
        <p>The page you requested could not be found.</p>
        <Link className="button button-primary" href="/home">
          Return Home
        </Link>
      </div>
    </main>
  );
}
