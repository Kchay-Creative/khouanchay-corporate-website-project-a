"use client";
import { useSyncExternalStore } from "react";
import { createInitialOrganization } from "./seed";
import { validateOrganization } from "./model";
import type { OrganizationData } from "./types";

export const organizationStorageKey = "kcc_demo_organization_v1";
export const organizationBackupStorageKey =
  "kcc_demo_organization_backup_before_president_only_reset_v1";
const organizationRootResetMarkerKey =
  "kcc_demo_organization_president_only_reset_v1";
const organizationRootResetMarkerValue = "complete";
const localUpdateEvent = "kcc-organization-update";
const serverSnapshot = createInitialOrganization();
let cachedRaw: string | null | undefined;
let cachedData = serverSnapshot;

function readStoredOrganization(): OrganizationData {
  try {
    let saved = window.localStorage.getItem(organizationStorageKey);
    const rootResetComplete =
      window.localStorage.getItem(organizationRootResetMarkerKey) ===
      organizationRootResetMarkerValue;

    if (!rootResetComplete) {
      if (
        saved &&
        window.localStorage.getItem(organizationBackupStorageKey) === null
      ) {
        window.localStorage.setItem(organizationBackupStorageKey, saved);
      }

      const initial = createInitialOrganization();
      const serialized = JSON.stringify(initial);
      window.localStorage.setItem(organizationStorageKey, serialized);
      window.localStorage.setItem(
        organizationRootResetMarkerKey,
        organizationRootResetMarkerValue,
      );
      saved = serialized;
      cachedRaw = serialized;
      cachedData = initial;
      return cachedData;
    }

    if (saved === cachedRaw) return cachedData;
    cachedRaw = saved;
    if (!saved) {
      cachedData = createInitialOrganization();
      return cachedData;
    }
    const parsed: unknown = JSON.parse(saved);
    cachedData = validateOrganization(parsed)
      ? parsed
      : createInitialOrganization();
    return cachedData;
  } catch {
    cachedData = createInitialOrganization();
    return cachedData;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(localUpdateEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(localUpdateEvent, callback);
  };
}

export function useOrganizationData() {
  const data = useSyncExternalStore(
    subscribe,
    readStoredOrganization,
    () => serverSnapshot,
  );

  const save = (next: OrganizationData) => {
    if (!validateOrganization(next)) return false;
    try {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(organizationStorageKey, serialized);
      cachedRaw = serialized;
      cachedData = next;
      window.dispatchEvent(new Event(localUpdateEvent));
      return true;
    } catch {
      return false;
    }
  };

  const reset = () => {
    const next = createInitialOrganization();
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(organizationStorageKey, serialized);
    cachedRaw = serialized;
    cachedData = next;
    window.dispatchEvent(new Event(localUpdateEvent));
    return next;
  };

  return { data, ready: true, save, reset };
}
