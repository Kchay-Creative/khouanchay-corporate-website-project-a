"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ExpandDirection = "left" | "right";

type ExpandableSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder: string;
  ariaLabel: string;
  closeLabel: string;
  expandDirection?: ExpandDirection;
  className?: string;
  onSearch?: (value: string) => void;
};

export function ExpandableSearchBar({
  value,
  onValueChange,
  open,
  onOpenChange,
  placeholder,
  ariaLabel,
  closeLabel,
  expandDirection = "right",
  className,
  onSearch,
}: ExpandableSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmittedValue = useRef<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const closeSearch = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeSearch();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue || nextValue === lastSubmittedValue.current) return;
    lastSubmittedValue.current = nextValue;
    onSearch?.(nextValue);
  };

  const handleValueChange = (nextValue: string) => {
    if (nextValue.trim() !== lastSubmittedValue.current) {
      lastSubmittedValue.current = null;
    }
    onValueChange(nextValue);
  };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const };

  return (
    <div
      className={cn(
        "expandable-search-bar",
        `expandable-search-bar--${expandDirection}`,
        open && "is-open",
        className,
      )}
      onPointerDownCapture={(event) => event.stopPropagation()}
      onPointerMoveCapture={(event) => event.stopPropagation()}
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <motion.div
        layout="size"
        className={cn("expandable-search-bar__surface", open && "is-open")}
        transition={transition}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.form
              key="search-form"
              className="expandable-search-bar__form"
              role="search"
              onSubmit={handleSubmit}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <Search aria-hidden="true" size={18} strokeWidth={2} />
              <input
                ref={inputRef}
                type="search"
                value={value}
                placeholder={placeholder}
                aria-label={ariaLabel}
                onChange={(event) => handleValueChange(event.target.value)}
              />
              <button
                type="button"
                className="expandable-search-bar__close"
                aria-label={closeLabel}
                onClick={closeSearch}
              >
                <X aria-hidden="true" size={18} strokeWidth={2} />
              </button>
            </motion.form>
          ) : (
            <motion.button
              key="search-trigger"
              type="button"
              className="expandable-search-bar__trigger"
              aria-label={ariaLabel}
              title={ariaLabel}
              onClick={() => onOpenChange(true)}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <Search aria-hidden="true" size={20} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
