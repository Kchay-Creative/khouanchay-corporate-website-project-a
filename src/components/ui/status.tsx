import Link from "next/link";
export function AuthRequired({ next = "/management" }: { next?: string }) {
  return (
    <main className="status-page">
      <div className="status-card">
        <span className="status-code">Sign in</span>
        <h1>Authentication Required</h1>
        <p>Please sign in to access this page.</p>
        <Link
          className="button button-primary"
          href={`/login?next=${encodeURIComponent(next)}`}
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
export function AccessDenied() {
  return (
    <main className="status-page">
      <div className="status-card">
        <span className="status-code">403</span>
        <h1>Access Denied</h1>
        <p>Your account does not have permission to access this page.</p>
        <Link className="button button-primary" href="/management">
          Back to Management
        </Link>
      </div>
    </main>
  );
}
export function EmptyState({
  title = "No data available.",
  detail,
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
