"use client";

import { useSyncExternalStore } from "react";
import { createInitialOrganization } from "@/features/organization/seed";
import type { OrganizationData } from "@/features/organization/types";
import {
  createDefaultChartViewData,
  normalizeChartViewData,
  validateChartViewData,
} from "./model";
import type { ChartViewData } from "./types";

export const chartViewStorageKey = "kcc_chart_views_v1";
const localUpdateEvent = "kcc-chart-views-update";
const serverSnapshot = createDefaultChartViewData(createInitialOrganization());
let cachedKey = "";
let cachedData = serverSnapshot;

function organizationKey(organization: OrganizationData): string {
  return organization.positions.map((position) => position.id).sort().join("|");
}

function readStoredChartViews(
  organization: OrganizationData,
): ChartViewData {
  try {
    const raw = window.localStorage.getItem(chartViewStorageKey);
    const key = `${raw ?? ""}\u0000${organizationKey(organization)}`;
    if (key === cachedKey) return cachedData;

    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const normalized = normalizeChartViewData(parsed, organization);
    const serialized = JSON.stringify(normalized);
    // Persist only the initial migration here. A same-tick organization update
    // can briefly expose the previous position list; writing that normalized
    // snapshot would incorrectly discard newly created memberships.
    if (!raw)
      window.localStorage.setItem(chartViewStorageKey, serialized);
    cachedKey = `${serialized}\u0000${organizationKey(organization)}`;
    cachedData = normalized;
    return cachedData;
  } catch {
    cachedData = createDefaultChartViewData(organization);
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

export function useChartViewData(organization: OrganizationData) {
  const data = useSyncExternalStore(
    subscribe,
    () => readStoredChartViews(organization),
    () => serverSnapshot,
  );

  const save = (
    next: ChartViewData,
    organizationForValidation: OrganizationData = organization,
  ) => {
    if (!validateChartViewData(next, organizationForValidation)) return false;
    try {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(chartViewStorageKey, serialized);
      cachedKey = `${serialized}\u0000${organizationKey(organizationForValidation)}`;
      cachedData = next;
      window.dispatchEvent(new Event(localUpdateEvent));
      return true;
    } catch {
      return false;
    }
  };

  return { data, ready: true, save };
}
