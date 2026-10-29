"use client";
import { useI18n } from "@/i18n/provider";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { dictionary: d } = useI18n();
  return (
    <main className="status-page">
      <div className="status-card">
        <h1>{d.status.errorTitle}</h1>
        <p>{d.status.errorBody}</p>
        <button className="button button-primary" onClick={reset}>
          {d.status.retry}
        </button>
      </div>
    </main>
  );
}
