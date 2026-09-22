"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavItem } from "@/config/navigation";

export function PublicShell({
  children,
  items,
  account,
}: {
  children: React.ReactNode;
  items: NavItem[];
  account: string | null;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link
            href="/home"
            className="wordmark"
            aria-label="Khouanchay Trading home"
          >
            <span className="wordmark-mark" aria-hidden="true">
              K
            </span>
            <span>
              Khouanchay <small>TRADING</small>
            </span>
          </Link>
          <button
            className="mobile-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
          <nav
            id="primary-nav"
            className={`site-nav ${open ? "is-open" : ""}`}
            aria-label="Primary navigation"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={
                  path === item.href ||
                  (item.href !== "/home" && path.startsWith(item.href + "/"))
                    ? "page"
                    : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <span
              className="language-label"
              title="Language options will be added with multilingual content"
            >
              EN
            </span>
            {account ? (
              <form action="/api/dev-auth/logout" method="post">
                <button className="text-button" type="submit" title={account}>
                  Account · Sign out
                </button>
              </form>
            ) : (
              <Link className="text-button" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>Khouanchay Trading</strong>
            <p>Corporate website · Initial development content</p>
          </div>
          <div className="footer-links">
            <Link href="/company">Company</Link>
            <Link href="/business">Business</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          © {new Date().getFullYear()} Khouanchay Trading. Company details and
          brand assets pending confirmation.
        </div>
      </footer>
    </div>
  );
}
