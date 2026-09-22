"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavItem } from "@/config/navigation";
function SideItems({
  items,
  path,
  close,
}: {
  items: NavItem[];
  path: string;
  close: () => void;
}) {
  return (
    <ul className="management-menu">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={close}
            aria-current={path === item.href ? "page" : undefined}
          >
            <span className="menu-symbol" aria-hidden="true">
              {item.href.endsWith("/edit") ? "✎" : "▦"}
            </span>
            <span>{item.label}</span>
          </Link>
          {item.children?.length ? (
            <SideItems items={item.children} path={path} close={close} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
export function ManagementShell({
  children,
  items,
  user,
}: {
  children: React.ReactNode;
  items: NavItem[];
  user: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={`management-shell ${collapsed ? "is-collapsed" : ""} ${path.startsWith("/management/edit") ? "is-admin-mode" : ""}`}
    >
      {open ? (
        <button
          className="drawer-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`management-sidebar ${open ? "drawer-open" : ""}`}
        aria-label="Management navigation"
      >
        <div className="sidebar-brand">
          <Link href="/management" onClick={() => setOpen(false)}>
            <span className="wordmark-mark" aria-hidden="true">
              K
            </span>
            <span className="sidebar-brand-text">
              Khouanchay <small>Management</small>
            </span>
          </Link>
          <button
            className="collapse-button"
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            ☰
          </button>
        </div>
        <div className="sidebar-group">
          <span className="sidebar-label">Workspace</span>
          <SideItems items={items} path={path} close={() => setOpen(false)} />
          <div className="future-sections">
            Future management sections will appear here.
          </div>
        </div>
        <div className="sidebar-bottom">
          <Link href="/home" onClick={() => setOpen(false)}>
            <span className="menu-symbol" aria-hidden="true">
              ←
            </span>
            <span>Back to Website</span>
          </Link>
          <div className="sidebar-account">
            <span className="account-avatar" aria-hidden="true">
              {user.charAt(0).toUpperCase()}
            </span>
            <span className="account-name">{user}</span>
          </div>
        </div>
      </aside>
      <div className="management-main">
        <header className="management-topbar">
          <button
            className="drawer-button"
            type="button"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
          <div className="breadcrumb">
            Management <span>/</span>{" "}
            {path.startsWith("/management/edit")
              ? "Administration"
              : "Overview"}
          </div>
          <div className="topbar-end">
            <span className="topbar-user">{user}</span>
            <form action="/api/dev-auth/logout" method="post">
              <button className="text-button" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="management-content">{children}</main>
      </div>
    </div>
  );
}
