import Link from "next/link";
import { getI18n, pageMetadata } from "@/i18n/server";

export async function generateMetadata() {
  return pageMetadata("notFound");
}

export default async function NotFound() {
  const { dictionary: d } = await getI18n();
  return (
    <main className="status-page">
      <div className="status-card">
        <span className="status-code">404</span>
        <h1>{d.status.notFoundTitle}</h1>
        <p>{d.status.notFoundBody}</p>
        <Link className="button button-primary" href="/home">
          {d.status.returnHome}
        </Link>
      </div>
    </main>
  );
}
