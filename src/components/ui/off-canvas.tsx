"use client";

import { useEffect, useId, useRef } from "react";

export function OffCanvas({
  open,
  side,
  title,
  closeLabel,
  onClose,
  children,
  className = "",
}: {
  open: boolean;
  side: "left" | "right";
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  return (
    <div
      className={`offcanvas-layer ${open ? "is-open" : ""}`}
      data-side={side}
      aria-hidden={!open}
    >
      <button
        className="offcanvas-scrim"
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={`offcanvas-panel ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open ? true : undefined}
      >
        <header className="offcanvas-header">
          <h2 id={titleId}>{title}</h2>
          <button
            ref={closeRef}
            className="offcanvas-close"
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="offcanvas-body">{children}</div>
      </aside>
    </div>
  );
}
