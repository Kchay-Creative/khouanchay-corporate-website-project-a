import type { Locale } from "@/i18n";
import { assignedPerson, sortedPositions } from "@/features/organization/model";
import type {
  OrganizationData,
  OrganizationTreeNode,
  Position,
} from "@/features/organization/types";
import type {
  ChartView,
  ChartViewData,
  ChartViewLink,
  ChartViewResult,
} from "./types";

export const executiveChartViewId = "chart-view-executive";
export const executiveChartViewSlug = "executive";

function uniqueId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function slugBase(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function uniqueSlug(data: ChartViewData, value: string): string {
  const base = slugBase(value) || "chart";
  const used = new Set(data.views.map((view) => view.slug));
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function createDefaultChartViewData(
  organization: OrganizationData,
): ChartViewData {
  return {
    schemaVersion: 1,
    views: [
      {
        id: executiveChartViewId,
        nameLo: "ຄະນະບໍລິຫານ",
        nameEn: "Executive",
        slug: executiveChartViewSlug,
        parentViewId: null,
        rootPositionId: organization.rootPositionId,
        order: 0,
        isDefault: true,
        isActive: true,
      },
    ],
    memberships: organization.positions.map((position) => ({
      viewId: executiveChartViewId,
      positionId: position.id,
    })),
    links: [],
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function validateChartViewData(
  value: unknown,
  organization: OrganizationData,
): value is ChartViewData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ChartViewData>;
  if (
    data.schemaVersion !== 1 ||
    !Array.isArray(data.views) ||
    !Array.isArray(data.memberships) ||
    !Array.isArray(data.links)
  )
    return false;

  const positionIds = new Set(
    organization.positions.map((position) => position.id),
  );
  const viewIds = new Set<string>();
  const slugs = new Set<string>();
  let defaultCount = 0;

  for (const view of data.views) {
    if (
      !view ||
      !isString(view.id) ||
      !isString(view.nameLo) ||
      !isString(view.nameEn) ||
      !isString(view.slug) ||
      !view.slug ||
      (view.parentViewId !== null && !isString(view.parentViewId)) ||
      !isString(view.rootPositionId) ||
      !positionIds.has(view.rootPositionId) ||
      typeof view.order !== "number" ||
      !Number.isFinite(view.order) ||
      typeof view.isDefault !== "boolean" ||
      typeof view.isActive !== "boolean" ||
      viewIds.has(view.id) ||
      slugs.has(view.slug)
    )
      return false;
    viewIds.add(view.id);
    slugs.add(view.slug);
    if (view.isDefault) defaultCount += 1;
  }

  const defaultView = data.views.find((view) => view.isDefault);
  if (
    defaultCount !== 1 ||
    !defaultView ||
    defaultView.id !== executiveChartViewId ||
    defaultView.slug !== executiveChartViewSlug ||
    defaultView.parentViewId !== null ||
    defaultView.rootPositionId !== organization.rootPositionId ||
    !defaultView.isActive
  )
    return false;

  for (const view of data.views) {
    if (view.parentViewId !== null && !viewIds.has(view.parentViewId))
      return false;
    const path = new Set([view.id]);
    let current = view;
    while (current.parentViewId) {
      if (path.has(current.parentViewId)) return false;
      path.add(current.parentViewId);
      const parent = data.views.find(
        (candidate) => candidate.id === current.parentViewId,
      );
      if (!parent) return false;
      current = parent;
    }
  }

  const membershipKeys = new Set<string>();
  for (const membership of data.memberships) {
    if (
      !membership ||
      !isString(membership.viewId) ||
      !viewIds.has(membership.viewId) ||
      !isString(membership.positionId) ||
      !positionIds.has(membership.positionId)
    )
      return false;
    const key = `${membership.viewId}\u0000${membership.positionId}`;
    if (membershipKeys.has(key)) return false;
    membershipKeys.add(key);
  }

  for (const view of data.views) {
    if (!membershipKeys.has(`${view.id}\u0000${view.rootPositionId}`))
      return false;
  }

  const linkKeys = new Set<string>();
  for (const link of data.links) {
    if (
      !link ||
      !isString(link.sourceViewId) ||
      !viewIds.has(link.sourceViewId) ||
      !isString(link.sourcePositionId) ||
      !positionIds.has(link.sourcePositionId) ||
      !membershipKeys.has(`${link.sourceViewId}\u0000${link.sourcePositionId}`) ||
      !isString(link.targetViewId) ||
      !viewIds.has(link.targetViewId) ||
      link.sourceViewId === link.targetViewId
    )
      return false;
    const key = `${link.sourceViewId}\u0000${link.sourcePositionId}`;
    if (linkKeys.has(key)) return false;
    linkKeys.add(key);
  }

  return true;
}

export function normalizeChartViewData(
  value: unknown,
  organization: OrganizationData,
): ChartViewData {
  if (!value || typeof value !== "object")
    return createDefaultChartViewData(organization);

  const source = value as Partial<ChartViewData>;
  if (
    source.schemaVersion !== 1 ||
    !Array.isArray(source.views) ||
    !Array.isArray(source.memberships) ||
    !Array.isArray(source.links)
  )
    return createDefaultChartViewData(organization);

  const positionIds = new Set(
    organization.positions.map((position) => position.id),
  );
  const executive = source.views.find(
    (view) => view?.id === executiveChartViewId,
  );
  const views: ChartView[] = [
    {
      id: executiveChartViewId,
      nameLo:
        typeof executive?.nameLo === "string" && executive.nameLo.trim()
          ? executive.nameLo.trim()
          : "ຄະນະບໍລິຫານ",
      nameEn:
        typeof executive?.nameEn === "string" && executive.nameEn.trim()
          ? executive.nameEn.trim()
          : "Executive",
      slug: executiveChartViewSlug,
      parentViewId: null,
      rootPositionId: organization.rootPositionId,
      order: 0,
      isDefault: true,
      isActive: true,
    },
  ];
  const usedIds = new Set([executiveChartViewId]);
  const usedSlugs = new Set([executiveChartViewSlug]);

  for (const candidate of source.views) {
    if (
      !candidate ||
      candidate.id === executiveChartViewId ||
      typeof candidate.id !== "string" ||
      usedIds.has(candidate.id) ||
      typeof candidate.nameLo !== "string" ||
      typeof candidate.nameEn !== "string" ||
      typeof candidate.slug !== "string" ||
      !candidate.slug ||
      usedSlugs.has(candidate.slug) ||
      typeof candidate.rootPositionId !== "string" ||
      !positionIds.has(candidate.rootPositionId)
    )
      continue;
    views.push({
      id: candidate.id,
      nameLo: candidate.nameLo,
      nameEn: candidate.nameEn,
      slug: candidate.slug,
      parentViewId:
        typeof candidate.parentViewId === "string"
          ? candidate.parentViewId
          : null,
      rootPositionId: candidate.rootPositionId,
      order:
        typeof candidate.order === "number" && Number.isFinite(candidate.order)
          ? candidate.order
          : views.length,
      isDefault: false,
      isActive: candidate.isActive !== false,
    });
    usedIds.add(candidate.id);
    usedSlugs.add(candidate.slug);
  }

  const validViewIds = new Set(views.map((view) => view.id));
  for (const view of views) {
    if (view.parentViewId && !validViewIds.has(view.parentViewId))
      view.parentViewId = null;
  }

  const memberships: ChartViewData["memberships"] = [];
  const membershipKeys = new Set<string>();
  for (const membership of source.memberships) {
    if (
      !membership ||
      typeof membership.viewId !== "string" ||
      !validViewIds.has(membership.viewId) ||
      typeof membership.positionId !== "string" ||
      !positionIds.has(membership.positionId)
    )
      continue;
    const key = `${membership.viewId}\u0000${membership.positionId}`;
    if (membershipKeys.has(key)) continue;
    membershipKeys.add(key);
    memberships.push({
      viewId: membership.viewId,
      positionId: membership.positionId,
    });
  }
  for (const view of views) {
    const key = `${view.id}\u0000${view.rootPositionId}`;
    if (!membershipKeys.has(key)) {
      membershipKeys.add(key);
      memberships.push({ viewId: view.id, positionId: view.rootPositionId });
    }
  }

  const links: ChartViewLink[] = [];
  const linkKeys = new Set<string>();
  for (const link of source.links) {
    if (
      !link ||
      typeof link.sourceViewId !== "string" ||
      !validViewIds.has(link.sourceViewId) ||
      typeof link.sourcePositionId !== "string" ||
      !positionIds.has(link.sourcePositionId) ||
      !membershipKeys.has(`${link.sourceViewId}\u0000${link.sourcePositionId}`) ||
      typeof link.targetViewId !== "string" ||
      !validViewIds.has(link.targetViewId) ||
      link.sourceViewId === link.targetViewId
    )
      continue;
    const key = `${link.sourceViewId}\u0000${link.sourcePositionId}`;
    if (linkKeys.has(key)) continue;
    linkKeys.add(key);
    links.push({
      sourceViewId: link.sourceViewId,
      sourcePositionId: link.sourcePositionId,
      targetViewId: link.targetViewId,
    });
  }

  const normalized: ChartViewData = {
    schemaVersion: 1,
    views,
    memberships,
    links,
  };
  return validateChartViewData(normalized, organization)
    ? normalized
    : createDefaultChartViewData(organization);
}

export function chartViewName(view: ChartView, locale: Locale): string {
  return (locale === "lo" ? view.nameLo : view.nameEn) || view.nameEn || view.nameLo;
}

export function orderedChartViews(
  data: ChartViewData,
  includeInactive = false,
): ChartView[] {
  return data.views
    .filter((view) => includeInactive || view.isActive)
    .toSorted((a, b) => a.order - b.order || a.nameEn.localeCompare(b.nameEn));
}

export function chartViewBySlug(
  data: ChartViewData,
  slug: string | null,
): ChartView {
  return (
    data.views.find((view) => view.slug === slug && view.isActive) ??
    data.views.find((view) => view.isDefault) ??
    data.views[0]
  );
}

export function positionIdsForView(
  data: ChartViewData,
  viewId: string,
): Set<string> {
  return new Set(
    data.memberships
      .filter((membership) => membership.viewId === viewId)
      .map((membership) => membership.positionId),
  );
}

export function buildChartViewForest(
  organization: OrganizationData,
  chartViews: ChartViewData,
  view: ChartView,
): OrganizationTreeNode[] {
  const visible = positionIdsForView(chartViews, view.id);
  const positions = sortedPositions(organization).filter((position) =>
    visible.has(position.id),
  );
  const byParent = new Map<string, Position[]>();
  for (const position of positions) {
    if (!position.parentId || !visible.has(position.parentId)) continue;
    const siblings = byParent.get(position.parentId) ?? [];
    siblings.push(position);
    byParent.set(position.parentId, siblings);
  }
  const build = (position: Position): OrganizationTreeNode => ({
    position,
    person: assignedPerson(organization, position.id),
    children: (byParent.get(position.id) ?? []).map(build),
  });
  const root = positions.find((position) => position.id === view.rootPositionId);
  const disconnectedRoots = positions.filter(
    (position) =>
      position.id !== view.rootPositionId &&
      (!position.parentId || !visible.has(position.parentId)),
  );
  return [...(root ? [build(root)] : []), ...disconnectedRoots.map(build)];
}

export function disconnectedPositionsForView(
  organization: OrganizationData,
  chartViews: ChartViewData,
  view: ChartView,
): Position[] {
  const visible = positionIdsForView(chartViews, view.id);
  return sortedPositions(organization).filter(
    (position) =>
      visible.has(position.id) &&
      position.id !== view.rootPositionId &&
      (!position.parentId || !visible.has(position.parentId)),
  );
}

export function linksForView(
  data: ChartViewData,
  viewId: string,
): Map<string, ChartView> {
  const views = new Map(data.views.map((view) => [view.id, view]));
  const result = new Map<string, ChartView>();
  for (const link of data.links) {
    if (link.sourceViewId !== viewId) continue;
    const target = views.get(link.targetViewId);
    if (target?.isActive) result.set(link.sourcePositionId, target);
  }
  return result;
}

export function chartViewTrail(
  data: ChartViewData,
  viewId: string,
): ChartView[] {
  const byId = new Map(data.views.map((view) => [view.id, view]));
  const trail: ChartView[] = [];
  const visited = new Set<string>();
  let current = byId.get(viewId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    current = current.parentViewId
      ? byId.get(current.parentViewId)
      : undefined;
  }
  const executive = data.views.find((view) => view.isDefault);
  if (executive && trail[0]?.id !== executive.id) trail.unshift(executive);
  return trail;
}

export function createChartView(
  data: ChartViewData,
  organization: OrganizationData,
  input: {
    nameLo: string;
    nameEn: string;
    rootPositionId: string;
    parentViewId: string | null;
    sourcePositionId?: string;
  },
): ChartViewResult {
  const nameLo = input.nameLo.trim();
  const nameEn = input.nameEn.trim();
  if (!nameLo && !nameEn) return { ok: false, error: "name-required" };
  if (!organization.positions.some((position) => position.id === input.rootPositionId))
    return { ok: false, error: "position-not-found" };
  if (input.parentViewId && !data.views.some((view) => view.id === input.parentViewId))
    return { ok: false, error: "parent-view-not-found" };

  const viewId = uniqueId("chart-view");
  const view: ChartView = {
    id: viewId,
    nameLo: nameLo || nameEn,
    nameEn: nameEn || nameLo,
    slug: uniqueSlug(data, nameEn || nameLo),
    parentViewId: input.parentViewId,
    rootPositionId: input.rootPositionId,
    order: data.views.length,
    isDefault: false,
    isActive: true,
  };
  const next: ChartViewData = {
    ...data,
    views: [...data.views, view],
    memberships: [
      ...data.memberships,
      { viewId, positionId: input.rootPositionId },
    ],
    links:
      input.parentViewId && input.sourcePositionId
        ? [
            ...data.links.filter(
              (link) =>
                !(
                  link.sourceViewId === input.parentViewId &&
                  link.sourcePositionId === input.sourcePositionId
                ),
            ),
            {
              sourceViewId: input.parentViewId,
              sourcePositionId: input.sourcePositionId,
              targetViewId: viewId,
            },
          ]
        : data.links,
  };
  return validateChartViewData(next, organization)
    ? { ok: true, data: next, viewId }
    : { ok: false, error: "invalid-data" };
}

export function updateChartView(
  data: ChartViewData,
  organization: OrganizationData,
  viewId: string,
  input: {
    nameLo: string;
    nameEn: string;
    rootPositionId: string;
    parentViewId: string | null;
    isActive: boolean;
  },
): ChartViewResult {
  const current = data.views.find((view) => view.id === viewId);
  if (!current) return { ok: false, error: "view-not-found" };
  const nameLo = input.nameLo.trim();
  const nameEn = input.nameEn.trim();
  if (!nameLo && !nameEn) return { ok: false, error: "name-required" };
  if (!organization.positions.some((position) => position.id === input.rootPositionId))
    return { ok: false, error: "position-not-found" };
  if (input.parentViewId === viewId) return { ok: false, error: "view-cycle" };
  if (input.parentViewId && !data.views.some((view) => view.id === input.parentViewId))
    return { ok: false, error: "parent-view-not-found" };
  let parent = input.parentViewId
    ? data.views.find((view) => view.id === input.parentViewId)
    : undefined;
  while (parent) {
    if (parent.id === viewId) return { ok: false, error: "view-cycle" };
    parent = parent.parentViewId
      ? data.views.find((view) => view.id === parent?.parentViewId)
      : undefined;
  }

  const rootPositionId = current.isDefault
    ? organization.rootPositionId
    : input.rootPositionId;
  const next: ChartViewData = {
    ...data,
    views: data.views.map((view) =>
      view.id === viewId
        ? {
            ...view,
            nameLo: nameLo || nameEn,
            nameEn: nameEn || nameLo,
            parentViewId: view.isDefault ? null : input.parentViewId,
            rootPositionId,
            isActive: view.isDefault ? true : input.isActive,
          }
        : view,
    ),
    memberships: data.memberships.some(
      (membership) =>
        membership.viewId === viewId &&
        membership.positionId === rootPositionId,
    )
      ? data.memberships
      : [...data.memberships, { viewId, positionId: rootPositionId }],
  };
  return validateChartViewData(next, organization)
    ? { ok: true, data: next, viewId }
    : { ok: false, error: "invalid-data" };
}

export function deleteChartView(
  data: ChartViewData,
  organization: OrganizationData,
  viewId: string,
): ChartViewResult {
  const current = data.views.find((view) => view.id === viewId);
  if (!current) return { ok: false, error: "view-not-found" };
  if (current.isDefault) return { ok: false, error: "default-protected" };
  const next: ChartViewData = {
    ...data,
    views: data.views
      .filter((view) => view.id !== viewId)
      .map((view) =>
        view.parentViewId === viewId
          ? { ...view, parentViewId: current.parentViewId }
          : view,
      ),
    memberships: data.memberships.filter(
      (membership) => membership.viewId !== viewId,
    ),
    links: data.links.filter(
      (link) =>
        link.sourceViewId !== viewId && link.targetViewId !== viewId,
    ),
  };
  return validateChartViewData(next, organization)
    ? { ok: true, data: next, viewId: executiveChartViewId }
    : { ok: false, error: "invalid-data" };
}

export function setChartViewMembership(
  data: ChartViewData,
  organization: OrganizationData,
  viewId: string,
  positionId: string,
  included: boolean,
): ChartViewResult {
  const view = data.views.find((candidate) => candidate.id === viewId);
  if (!view) return { ok: false, error: "view-not-found" };
  if (!organization.positions.some((position) => position.id === positionId))
    return { ok: false, error: "position-not-found" };
  if (!included && view.rootPositionId === positionId)
    return { ok: false, error: "root-membership-protected" };
  const exists = data.memberships.some(
    (membership) =>
      membership.viewId === viewId && membership.positionId === positionId,
  );
  const next: ChartViewData = {
    ...data,
    memberships: included
      ? exists
        ? data.memberships
        : [...data.memberships, { viewId, positionId }]
      : data.memberships.filter(
          (membership) =>
            !(
              membership.viewId === viewId &&
              membership.positionId === positionId
            ),
        ),
    links: included
      ? data.links
      : data.links.filter(
          (link) =>
            !(
              link.sourceViewId === viewId &&
              link.sourcePositionId === positionId
            ),
        ),
  };
  return validateChartViewData(next, organization)
    ? { ok: true, data: next, viewId }
    : { ok: false, error: "invalid-data" };
}

export function setChartViewLink(
  data: ChartViewData,
  organization: OrganizationData,
  sourceViewId: string,
  sourcePositionId: string,
  targetViewId: string | null,
): ChartViewResult {
  const sourceView = data.views.find((view) => view.id === sourceViewId);
  if (!sourceView) return { ok: false, error: "view-not-found" };
  if (!organization.positions.some((position) => position.id === sourcePositionId))
    return { ok: false, error: "position-not-found" };
  if (
    !data.memberships.some(
      (membership) =>
        membership.viewId === sourceViewId &&
        membership.positionId === sourcePositionId,
    )
  )
    return { ok: false, error: "invalid-data" };
  if (
    targetViewId &&
    (!data.views.some((view) => view.id === targetViewId) ||
      targetViewId === sourceViewId)
  )
    return { ok: false, error: "view-not-found" };

  const links = data.links.filter(
    (link) =>
      !(
        link.sourceViewId === sourceViewId &&
        link.sourcePositionId === sourcePositionId
      ),
  );
  if (targetViewId)
    links.push({ sourceViewId, sourcePositionId, targetViewId });
  const next = { ...data, links };
  return validateChartViewData(next, organization)
    ? { ok: true, data: next, viewId: sourceViewId }
    : { ok: false, error: "invalid-data" };
}

export function moveChartView(
  data: ChartViewData,
  organization: OrganizationData,
  viewId: string,
  direction: -1 | 1,
): ChartViewResult {
  const ordered = orderedChartViews(data, true);
  const index = ordered.findIndex((view) => view.id === viewId);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length)
    return { ok: true, data, viewId };
  const target = ordered[targetIndex];
  const current = ordered[index];
  const next: ChartViewData = {
    ...data,
    views: data.views.map((view) =>
      view.id === current.id
        ? { ...view, order: target.order }
        : view.id === target.id
          ? { ...view, order: current.order }
          : view,
    ),
  };
  return validateChartViewData(next, organization)
    ? { ok: true, data: next, viewId }
    : { ok: false, error: "invalid-data" };
}

export function removePositionFromChartViews(
  data: ChartViewData,
  organization: OrganizationData,
  positionId: string,
): ChartViewData | null {
  if (data.views.some((view) => view.rootPositionId === positionId)) return null;
  const next: ChartViewData = {
    ...data,
    memberships: data.memberships.filter(
      (membership) => membership.positionId !== positionId,
    ),
    links: data.links.filter(
      (link) => link.sourcePositionId !== positionId,
    ),
  };
  return validateChartViewData(next, organization) ? next : null;
}
