"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { OffCanvas } from "@/components/ui/off-canvas";
import type { NavItem } from "@/config/navigation";
import { defaultLocale, localeCookie, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { can, type Role } from "@/permissions";

type NavbarContrast = "light" | "dark";
type HomeSectionId = NonNullable<NavItem["sectionId"]>;

const homeSectionIds: readonly HomeSectionId[] = [
  "home",
  "company",
  "business",
  "brands",
  "contact",
];

function isHomeSectionId(value: string): value is HomeSectionId {
  return homeSectionIds.includes(value as HomeSectionId);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const navbarSectionContrast: ReadonlyArray<{
  selector: string;
  contrast: NavbarContrast;
}> = [
  { selector: ".kcc-home-hero", contrast: "dark" },
  { selector: ".kcc-home-business-card", contrast: "light" },
  { selector: ".kcc-home-business", contrast: "dark" },
  { selector: ".kcc-home-strengths", contrast: "light" },
  { selector: ".kcc-home-news-image-wrap", contrast: "dark" },
  { selector: ".kcc-home-news-copy", contrast: "light" },
  { selector: ".kcc-home-news-card", contrast: "light" },
  { selector: ".kcc-home-news", contrast: "dark" },
  { selector: ".site-footer", contrast: "dark" },
  { selector: ".page-hero", contrast: "light" },
  { selector: ".content-section", contrast: "light" },
  { selector: ".simple-cta", contrast: "light" },
  { selector: ".career-band", contrast: "light" },
  { selector: ".login-page", contrast: "light" },
  { selector: ".status-page", contrast: "light" },
  { selector: ".management-shell", contrast: "light" },
  { selector: "main", contrast: "light" },
];

export function GlobalNavbar({
  items,
  account,
}: {
  items: NavItem[];
  account: {
    name: string | null;
    email: string | null;
    role: Exclude<Role, "guest">;
  } | null;
}) {
  const path = usePathname();
  const { locale, dictionary: d } = useI18n();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSectionId>("home");
  const [contrastState, setContrastState] = useState<{
    path: string;
    value: NavbarContrast;
  }>({ path, value: path === "/home" ? "dark" : "light" });
  const scrollSentinel = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const scrollToHomeSection = useCallback(
    (sectionId: HomeSectionId, smooth = true) => {
      const behavior = smooth && !prefersReducedMotion() ? "smooth" : "auto";
      if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior });
        return;
      }

      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior, block: "start" });
    },
    [],
  );

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop =
        document.scrollingElement?.scrollTop ??
        document.documentElement.scrollTop ??
        window.scrollY;
      setScrolled(scrollTop > 16);
    };

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { root: null, threshold: 0 },
    );

    updateScrollState();
    if (scrollSentinel.current) observer.observe(scrollSentinel.current);
    document.addEventListener("scroll", updateScrollState, {
      capture: true,
      passive: true,
    });

    return () => {
      observer.disconnect();
      document.removeEventListener("scroll", updateScrollState, true);
    };
  }, [path]);

  useEffect(() => {
    if (path !== "/home") return;

    let animationFrame = 0;
    let initialFrame = 0;
    let layoutFrame = 0;
    let fontFrame = 0;
    let cancelled = false;

    const sectionFromLocation = (): HomeSectionId => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      return isHomeSectionId(hash) ? hash : "home";
    };

    const resolveActiveSection = () => {
      animationFrame = 0;
      const headerHeight =
        headerRef.current?.getBoundingClientRect().height ?? 0;
      const probeY =
        headerHeight + Math.min(150, Math.max(64, window.innerHeight * 0.2));
      let nextSection: HomeSectionId = "home";

      for (const sectionId of homeSectionIds) {
        const section = document.getElementById(sectionId);
        if (!section) continue;
        const bounds = section.getBoundingClientRect();
        if (bounds.top <= probeY) nextSection = sectionId;
        if (bounds.top <= probeY && bounds.bottom > probeY) break;
      }

      setActiveSection((current) =>
        current === nextSection ? current : nextSection,
      );
    };

    const scheduleActiveSectionUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(resolveActiveSection);
    };

    const restoreSectionFromLocation = (smooth = true) => {
      const sectionId = sectionFromLocation();
      setActiveSection(sectionId);
      window.requestAnimationFrame(() =>
        scrollToHomeSection(sectionId, smooth),
      );
    };

    const handleLocationChange = () => restoreSectionFromLocation(true);

    initialFrame = window.requestAnimationFrame(() => {
      layoutFrame = window.requestAnimationFrame(() =>
        restoreSectionFromLocation(false),
      );
    });
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      fontFrame = window.requestAnimationFrame(() =>
        restoreSectionFromLocation(false),
      );
    });

    document.addEventListener("scroll", scheduleActiveSectionUpdate, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", scheduleActiveSectionUpdate, {
      passive: true,
    });
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      cancelled = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (initialFrame) window.cancelAnimationFrame(initialFrame);
      if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
      if (fontFrame) window.cancelAnimationFrame(fontFrame);
      document.removeEventListener("scroll", scheduleActiveSectionUpdate, true);
      window.removeEventListener("resize", scheduleActiveSectionUpdate);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [path, scrollToHomeSection]);

  useEffect(() => {
    const observedSections = new Set<Element>();

    navbarSectionContrast.forEach(({ selector }) => {
      document.querySelectorAll(selector).forEach((section) => {
        observedSections.add(section);
      });
    });

    let animationFrame = 0;

    const resolveContrast = () => {
      animationFrame = 0;
      const header = headerRef.current;
      if (!header) return;

      const sampleY = Math.max(
        1,
        Math.min(
          window.innerHeight - 1,
          header.getBoundingClientRect().height / 2,
        ),
      );
      const samples: NavbarContrast[] = [];

      [0.5, 0.22, 0.78].forEach((horizontalPosition) => {
        const sampleX = Math.min(
          window.innerWidth - 1,
          Math.max(1, window.innerWidth * horizontalPosition),
        );
        for (const element of document.elementsFromPoint(sampleX, sampleY)) {
          if (header.contains(element)) continue;
          const matchingRule = navbarSectionContrast.find(({ selector }) =>
            element.closest(selector),
          );
          if (!matchingRule) continue;
          samples.push(matchingRule.contrast);
          break;
        }
      });

      const lightCount = samples.filter((value) => value === "light").length;
      const darkCount = samples.length - lightCount;
      const value =
        samples.length === 0
          ? path === "/home"
            ? "dark"
            : "light"
          : darkCount > lightCount
            ? "dark"
            : lightCount > darkCount
              ? "light"
              : samples[0];

      setContrastState((current) =>
        current.path === path && current.value === value
          ? current
          : { path, value },
      );
    };

    const scheduleContrastUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(resolveContrast);
    };

    const observer = new IntersectionObserver(scheduleContrastUpdate, {
      root: null,
      threshold: [0, 0.01, 0.5, 1],
    });
    observedSections.forEach((section) => observer.observe(section));

    const resizeObserver = new ResizeObserver(scheduleContrastUpdate);
    if (headerRef.current) resizeObserver.observe(headerRef.current);

    resolveContrast();
    document.addEventListener("scroll", scheduleContrastUpdate, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", scheduleContrastUpdate, {
      passive: true,
    });

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("scroll", scheduleContrastUpdate, true);
      window.removeEventListener("resize", scheduleContrastUpdate);
    };
  }, [path]);

  useEffect(() => {
    const savedLocale = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${localeCookie}=`))
      ?.split("=")[1];
    if (savedLocale !== "th") return;
    document.cookie = `${localeCookie}=${defaultLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);
  function changeLanguage(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  function handleNavigationClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) {
    setOpen(false);
    if (
      path !== "/home" ||
      !item.sectionId ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const destination =
      item.sectionId === "home" ? "/home" : `/home#${item.sectionId}`;
    if (`${window.location.pathname}${window.location.hash}` !== destination) {
      window.history.pushState(window.history.state, "", destination);
    }
    setActiveSection(item.sectionId);
    scrollToHomeSection(item.sectionId);
  }

  const activeHref =
    path === "/home"
      ? items.find((item) => item.sectionId === activeSection)?.href
      : items
          .filter((item) => !item.sectionId)
          .filter(
            (item) =>
              path === item.href ||
              (item.href !== "/home" && path.startsWith(item.href + "/")),
          )
          .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const contrast =
    contrastState.path === path
      ? contrastState.value
      : path === "/home"
        ? "dark"
        : "light";

  return (
    <>
      <span
        ref={scrollSentinel}
        className="navbar-scroll-sentinel"
        aria-hidden="true"
      />
      <header
        ref={headerRef}
        className={`site-header is-on-${contrast}${path === "/home" ? " is-home" : ""}${scrolled ? " is-scrolled" : ""}`}
      >
        <div className="container header-inner">
          <Link
            href="/home"
            className="wordmark"
            aria-label={d.common.homeAria}
            onClick={() => setOpen(false)}
          >
            <Image
              className="wordmark-logo"
              src="/kcc-logo.png"
              alt=""
              width={512}
              height={512}
              sizes="60px"
              priority
            />
            <span className="wordmark-name">{d.common.companyName}</span>
          </Link>
          <button
            className="mobile-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? d.common.close : d.common.menu}
          </button>
          <nav
            id="primary-nav"
            className={`site-nav ${open ? "is-open" : ""}`}
            aria-label={d.common.globalNavigation}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavigationClick(event, item)}
                aria-current={
                  activeHref === item.href
                    ? item.sectionId
                      ? "location"
                      : "page"
                    : undefined
                }
              >
                {d.nav[item.labelKey]}
              </Link>
            ))}
          </nav>
          <div className="navbar-controls">
            <label className="language-control">
              <span>{d.common.language}</span>
              <select
                value={locale}
                aria-label={d.common.language}
                onChange={(event) =>
                  changeLanguage(event.target.value as Locale)
                }
              >
                <option value="lo">ລາວ</option>
                <option value="en">English</option>
              </select>
            </label>
            {account ? (
              <button
                className="navbar-settings-button"
                type="button"
                aria-label={d.settings.open}
                aria-expanded={settingsOpen}
                onClick={() => {
                  setOpen(false);
                  setSettingsOpen(true);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z" />
                  <path d="m19.4 13.5 1.3 1-.1 1-1.6 2.7-.9.4-1.6-.7a7.9 7.9 0 0 1-1.7 1l-.2 1.8-.8.6h-3.6l-.8-.6-.2-1.8a7.9 7.9 0 0 1-1.7-1l-1.6.7-.9-.4-1.6-2.7-.1-1 1.3-1a8.4 8.4 0 0 1 0-2l-1.3-1 .1-1L5 6.8l.9-.4 1.6.7a7.9 7.9 0 0 1 1.7-1l.2-1.8.8-.6h3.6l.8.6.2 1.8a7.9 7.9 0 0 1 1.7 1l1.6-.7.9.4 1.6 2.7.1 1-1.3 1a8.4 8.4 0 0 1 0 2Z" />
                </svg>
              </button>
            ) : (
              <Link className="navbar-sign-in" href="/login">
                {d.common.signIn}
              </Link>
            )}
          </div>
        </div>
      </header>
      {account ? (
        <OffCanvas
          open={settingsOpen}
          side="right"
          title={d.settings.title}
          closeLabel={d.settings.close}
          onClose={() => setSettingsOpen(false)}
          className="settings-drawer"
        >
          <div className="settings-profile">
            <span className="settings-avatar" aria-hidden="true">
              {account.name?.trim().charAt(0).toUpperCase() || "K"}
            </span>
            <div>
              <strong>{account.name || d.settings.unavailable}</strong>
              <span>{account.email || d.settings.emailUnavailable}</span>
            </div>
          </div>
          <section className="settings-section">
            <h3>{d.settings.accountInformation}</h3>
            <dl className="settings-account-list">
              <div>
                <dt>{d.settings.name}</dt>
                <dd>{account.name || d.settings.unavailable}</dd>
              </div>
              <div>
                <dt>{d.settings.email}</dt>
                <dd>{account.email || d.settings.emailUnavailable}</dd>
              </div>
              <div>
                <dt>{d.settings.role}</dt>
                <dd>
                  {account.role === "admin"
                    ? d.settings.adminRole
                    : d.settings.managerRole}
                </dd>
              </div>
            </dl>
          </section>
          {can(account.role, "management:edit") ? (
            <section className="settings-section">
              <h3>{d.settings.adminTools}</h3>
              <nav
                className="settings-module-list"
                aria-label={d.settings.adminTools}
              >
                <Link
                  href="/management/edit"
                  onClick={() => setSettingsOpen(false)}
                >
                  <span aria-hidden="true">⌘</span>
                  <span>
                    <strong>{d.settings.organizationEdit}</strong>
                    <small>{d.settings.organizationEditDescription}</small>
                  </span>
                </Link>
                {can(account.role, "brands:manage") ? (
                  <Link
                    href="/management/brands"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <span aria-hidden="true">⬡</span>
                    <span>
                      <strong>{d.settings.brandContent}</strong>
                      <small>{d.settings.brandContentDescription}</small>
                    </span>
                  </Link>
                ) : null}
              </nav>
            </section>
          ) : null}
          <form
            className="settings-logout"
            action="/api/dev-auth/logout"
            method="post"
          >
            <button className="button button-outline" type="submit">
              {d.common.signOut}
            </button>
          </form>
        </OffCanvas>
      ) : null}
    </>
  );
}
