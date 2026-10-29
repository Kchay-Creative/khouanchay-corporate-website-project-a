import { devAuthEnabled, getSession } from "@/auth/session";
import Link from "next/link";
import { formatMessage } from "@/i18n";
import { getI18n, pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("login");
}
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const { dictionary: d } = await getI18n();
  const c = d.login;
  const next = params.next === "/management/edit" ? params.next : "/management";
  return (
    <main className="login-page">
      <div className="login-card">
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
        {session ? (
          <div className="notice">
            {formatMessage(c.signedInAs, { name: session.id })}{" "}
            <Link href={next}>{c.continue}</Link>
          </div>
        ) : devAuthEnabled() ? (
          <form
            action="/api/dev-auth/login"
            method="post"
            className="login-form"
          >
            <input type="hidden" name="next" value={next} />
            <label>
              {c.email}
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
              />
            </label>
            <label>
              {c.password}
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            {params.error === "invalid" ? (
              <p className="form-error" role="alert">
                {c.invalid}
              </p>
            ) : null}
            <button className="button button-primary" type="submit">
              {c.submit}
            </button>
            <p className="form-help">{c.devHelp}</p>
          </form>
        ) : (
          <div className="notice">{c.disabled}</div>
        )}
      </div>
    </main>
  );
}
