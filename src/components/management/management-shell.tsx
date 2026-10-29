"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { OffCanvas } from "@/components/ui/off-canvas";
import type { NavItem } from "@/config/navigation";
import { useI18n } from "@/i18n/provider";

const ManagementShellContext = createContext<{ items: NavItem[] } | null>(null);

function SideItems({
  items,
  path,
  close,
}: {
  items: NavItem[];
  path: string;
  close: () => void;
}) {
  const { dictionary: d } = useI18n();
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
            <span>{d.nav[item.labelKey]}</span>
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
}: {
  children: React.ReactNode;
  items: NavItem[];
}) {
  const path = usePathname();
  return (
    <ManagementShellContext.Provider value={{ items }}>
      <div
        className={`management-shell ${path.startsWith("/management/edit") || path.startsWith("/management/brands") ? "is-admin-mode" : ""}`}
      >
        <main className="management-content">{children}</main>
      </div>
    </ManagementShellContext.Provider>
  );
}

export function ManagementDrawer({
  children,
}: {
  children?: React.ReactNode | ((close: () => void) => React.ReactNode);
}) {
  const path = usePathname();
  const { dictionary: d } = useI18n();
  const context = useContext(ManagementShellContext);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  if (!context) throw new Error("ManagementDrawer requires ManagementShell");

  return (
    <>
      <div className="management-drawer-trigger-row">
        <button
          className="management-drawer-trigger"
          type="button"
          aria-label={d.management.openNav}
          aria-expanded={open}
          aria-controls="management-workspace-drawer"
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span>{d.management.workspace}</span>
        </button>
      </div>
      <OffCanvas
        open={open}
        side="left"
        title={`${d.nav.management} · ${d.management.workspace}`}
        closeLabel={d.management.closeNav}
        onClose={close}
        className="management-workspace-drawer"
      >
        <div id="management-workspace-drawer">
          <div className="management-drawer-context">
            <span>{d.nav.management}</span>
            <strong>
              {path.startsWith("/management/brands")
                ? d.nav.brandManagement
                : path.startsWith("/management/edit")
                  ? d.management.administration
                  : d.management.overview}
            </strong>
          </div>
          <nav aria-label={d.management.secondaryNav}>
            <SideItems items={context.items} path={path} close={close} />
          </nav>
          <div className="future-sections">{d.management.futureSections}</div>
          {children ? (
            <div className="management-drawer-tools">
              {typeof children === "function" ? children(close) : children}
            </div>
          ) : null}
          <div className="sidebar-bottom">
            <Link href="/home" onClick={close}>
              <span className="menu-symbol" aria-hidden="true">
                ←
              </span>
              <span>{d.management.backToWebsite}</span>
            </Link>
          </div>
        </div>
      </OffCanvas>
    </>
  );
}
