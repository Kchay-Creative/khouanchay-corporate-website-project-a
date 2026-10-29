import Link from "next/link";
import { getI18n } from "@/i18n/server";
export async function AuthRequired({
  next = "/management",
}: {
  next?: string;
}) {
  const { dictionary: d } = await getI18n();
  return (
    <main className="status-page">
      <div className="status-card">
        <span className="status-code">{d.status.signInCode}</span>
        <h1>{d.status.authTitle}</h1>
        <p>{d.status.authBody}</p>
        <Link
          className="button button-primary"
          href={`/login?next=${encodeURIComponent(next)}`}
        >
          {d.status.signIn}
        </Link>
      </div>
    </main>
  );
}
export async function AccessDenied() {
  const { dictionary: d } = await getI18n();
  return (
    <main className="status-page">
      <div className="status-card">
        <span className="status-code">403</span>
        <h1>{d.status.deniedTitle}</h1>
        <p>{d.status.deniedBody}</p>
        <Link className="button button-primary" href="/management">
          {d.status.backManagement}
        </Link>
      </div>
    </main>
  );
}
export async function EmptyState({
  title,
  detail,
}: {
  title?: string;
  detail?: string;
}) {
  const { dictionary: d } = await getI18n();
  return (
    <div className="empty-state">
      <h3>{title ?? d.status.noData}</h3>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
