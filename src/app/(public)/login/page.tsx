import type { Metadata } from "next";
import { devAuthEnabled, getSession } from "@/auth/session";
import Link from "next/link";
export const metadata: Metadata = { title: "Sign In" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const next = params.next === "/management/edit" ? params.next : "/management";
  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Sign In</h1>
        <p>Authorized company users can access the Management workspace.</p>
        {session ? (
          <div className="notice">
            Signed in as {session.id}.{" "}
            <Link href={next}>Continue to Management</Link>
          </div>
        ) : devAuthEnabled() ? (
          <form
            action="/api/dev-auth/login"
            method="post"
            className="login-form"
          >
            <input type="hidden" name="next" value={next} />
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            {params.error === "invalid" ? (
              <p className="form-error" role="alert">
                Invalid email or password.
              </p>
            ) : null}
            <button className="button button-primary" type="submit">
              Sign In
            </button>
            <p className="form-help">
              Development accounts are configured locally in .env.local.
            </p>
          </form>
        ) : (
          <div className="notice">
            Sign in is not configured for this environment. Production
            authentication will be connected in a later phase.
          </div>
        )}
      </div>
    </main>
  );
}
