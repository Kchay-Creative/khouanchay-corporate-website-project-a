"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="status-page">
      <div className="status-card">
        <h1>Something went wrong</h1>
        <p>Please try again.</p>
        <button className="button button-primary" onClick={reset}>
          Retry
        </button>
      </div>
    </main>
  );
}
