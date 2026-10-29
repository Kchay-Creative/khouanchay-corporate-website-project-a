import type { Locale } from "@/i18n";
import type {
  OrganizationData,
  OrganizationResult,
  OrganizationTreeNode,
  Person,
  Position,
} from "./types";

function uniqueId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

type PersonDetailsInput = {
  personName: string;
  personImageUrl?: string | null;
  biographyTranslations?: Partial<Record<Locale, string>>;
};

function cleanTranslations(
  value: Partial<Record<Locale, string>> | undefined,
): Partial<Record<Locale, string>> | undefined {
  if (!value) return undefined;
  const lo = value.lo?.trim();
  const en = value.en?.trim();
  return lo || en ? { ...(lo ? { lo } : {}), ...(en ? { en } : {}) } : undefined;
}

export function positionTitle(position: Position, locale: Locale): string {
  return position.titleTranslations?.[locale] || position.title;
}

export function assignedPerson(
  data: OrganizationData,
  positionId: string,
): Person | null {
  const assignment = data.assignments.find(
    (item) => item.positionId === positionId && item.effectiveTo === null,
  );
  return assignment
    ? (data.people.find((person) => person.id === assignment.personId) ?? null)
    : null;
}

export function sortedPositions(data: OrganizationData): Position[] {
  return [...data.positions].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title),
  );
}

export function descendantsOf(
  data: OrganizationData,
  positionId: string,
): Set<string> {
  const descendants = new Set<string>();
  const visit = (parentId: string) => {
    for (const position of data.positions) {
      if (position.parentId === parentId && !descendants.has(position.id)) {
        descendants.add(position.id);
        visit(position.id);
      }
    }
  };
  visit(positionId);
  return descendants;
}

export function buildOrganizationTree(
  data: OrganizationData,
): OrganizationTreeNode {
  const byParent = new Map<string, Position[]>();
  for (const position of sortedPositions(data)) {
    if (!position.parentId) continue;
    const siblings = byParent.get(position.parentId) ?? [];
    siblings.push(position);
    byParent.set(position.parentId, siblings);
  }
  const root = data.positions.find(
    (position) => position.id === data.rootPositionId,
  );
  if (!root) throw new Error("Organization root is missing");
  const build = (position: Position): OrganizationTreeNode => ({
    position,
    person: assignedPerson(data, position.id),
    children: (byParent.get(position.id) ?? []).map(build),
  });
  return build(root);
}

export function validateOrganization(
  value: unknown,
): value is OrganizationData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<OrganizationData>;
  if (
    data.schemaVersion !== 1 ||
    typeof data.rootPositionId !== "string" ||
    !Array.isArray(data.positions) ||
    !Array.isArray(data.people) ||
    !Array.isArray(data.assignments)
  )
    return false;

  const positionIds = new Set<string>();
  for (const position of data.positions) {
    if (
      !position ||
      typeof position.id !== "string" ||
      typeof position.title !== "string" ||
      (position.unitType !== undefined &&
        position.unitType !== "position" &&
        position.unitType !== "department" &&
        position.unitType !== "team") ||
      (position.parentId !== null && typeof position.parentId !== "string") ||
      typeof position.displayOrder !== "number" ||
      positionIds.has(position.id)
    )
      return false;
    positionIds.add(position.id);
  }

  const root = data.positions.find(
    (position) => position.id === data.rootPositionId,
  );
  if (
    !root ||
    root.parentId !== null ||
    data.positions.filter((position) => position.parentId === null).length !== 1
  )
    return false;

  for (const position of data.positions) {
    if (position.id === data.rootPositionId) continue;
    if (
      !position.parentId ||
      position.parentId === position.id ||
      !positionIds.has(position.parentId)
    )
      return false;
    const path = new Set<string>([position.id]);
    let current: Position | undefined = position;
    while (current.parentId) {
      if (path.has(current.parentId)) return false;
      path.add(current.parentId);
      current = data.positions.find((item) => item.id === current?.parentId);
      if (!current) return false;
    }
    if (current.id !== data.rootPositionId) return false;
  }

  const personIds = new Set<string>();
  for (const person of data.people) {
    const biographies = person?.biographyTranslations;
    if (
      !person ||
      typeof person.id !== "string" ||
      typeof person.displayName !== "string" ||
      (person.imageUrl !== undefined &&
        person.imageUrl !== null &&
        typeof person.imageUrl !== "string") ||
      (biographies !== undefined &&
        (typeof biographies !== "object" ||
          biographies === null ||
          (biographies.lo !== undefined &&
            typeof biographies.lo !== "string") ||
          (biographies.en !== undefined &&
            typeof biographies.en !== "string"))) ||
      typeof person.isDemonstration !== "boolean" ||
      personIds.has(person.id)
    )
      return false;
    personIds.add(person.id);
  }

  const activePositions = new Set<string>();
  for (const assignment of data.assignments) {
    if (
      !assignment ||
      typeof assignment.id !== "string" ||
      !positionIds.has(assignment.positionId) ||
      !personIds.has(assignment.personId) ||
      (assignment.effectiveFrom !== null &&
        typeof assignment.effectiveFrom !== "string") ||
      (assignment.effectiveTo !== null &&
        typeof assignment.effectiveTo !== "string")
    )
      return false;
    if (assignment.effectiveTo === null) {
      if (activePositions.has(assignment.positionId)) return false;
      activePositions.add(assignment.positionId);
    }
  }
  return true;
}

function withAssignment(
  data: OrganizationData,
  positionId: string,
  input: PersonDetailsInput,
): OrganizationData {
  const name = input.personName.trim();
  const currentAssignment = data.assignments.find(
    (assignment) =>
      assignment.positionId === positionId && assignment.effectiveTo === null,
  );
  const current = currentAssignment
    ? (data.people.find((person) => person.id === currentAssignment.personId) ??
      null)
    : null;
  if (!name) {
    return currentAssignment
      ? {
          ...data,
          assignments: data.assignments.filter(
            (assignment) => assignment.id !== currentAssignment.id,
          ),
        }
      : data;
  }

  const biographyTranslations = cleanTranslations(
    input.biographyTranslations,
  );
  if (current) {
    return {
      ...data,
      people: data.people.map((person) =>
        person.id === current.id
          ? {
              ...person,
              displayName: name,
              imageUrl:
                input.personImageUrl === undefined
                  ? person.imageUrl
                  : input.personImageUrl,
              biographyTranslations:
                input.biographyTranslations === undefined
                  ? person.biographyTranslations
                  : biographyTranslations,
            }
          : person,
      ),
    };
  }

  const person: Person = {
    id: uniqueId("person"),
    displayName: name,
    imageUrl: input.personImageUrl,
    biographyTranslations,
    isDemonstration: true,
  };
  return {
    ...data,
    people: [...data.people, person],
    assignments: [
      ...data.assignments,
      {
        id: uniqueId("assignment"),
        positionId,
        personId: person.id,
        effectiveFrom: null,
        effectiveTo: null,
      },
    ],
  };
}

export function createPosition(
  data: OrganizationData,
  input: {
    title: string;
    parentId: string;
    department: string;
  } & PersonDetailsInput,
): OrganizationResult {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "title-required" };
  if (!input.parentId) return { ok: false, error: "parent-required" };
  if (!data.positions.some((position) => position.id === input.parentId))
    return { ok: false, error: "parent-not-found" };
  const positionId = uniqueId("position");
  const siblings = data.positions.filter(
    (position) => position.parentId === input.parentId,
  );
  const displayOrder =
    siblings.length === 0
      ? 0
      : Math.max(...siblings.map((position) => position.displayOrder)) + 1;
  let next: OrganizationData = {
    ...data,
    positions: [
      ...data.positions,
      {
        id: positionId,
        title,
        department: input.department.trim() || undefined,
        unitType: "position",
        parentId: input.parentId,
        displayOrder,
      },
    ],
  };
  next = withAssignment(next, positionId, input);
  return validateOrganization(next)
    ? { ok: true, data: next, positionId }
    : { ok: false, error: "invalid-data" };
}

export function updatePosition(
  data: OrganizationData,
  positionId: string,
  input: {
    title: string;
    parentId: string | null;
    department: string;
  } & PersonDetailsInput,
): OrganizationResult {
  const current = data.positions.find((position) => position.id === positionId);
  if (!current) return { ok: false, error: "position-not-found" };
  if (positionId === data.rootPositionId) {
    if (input.parentId !== null) return { ok: false, error: "root-parent" };
  } else {
    if (!input.title.trim()) return { ok: false, error: "title-required" };
    if (!input.parentId) return { ok: false, error: "parent-required" };
    if (input.parentId === positionId)
      return { ok: false, error: "self-parent" };
    if (!data.positions.some((position) => position.id === input.parentId))
      return { ok: false, error: "parent-not-found" };
    if (descendantsOf(data, positionId).has(input.parentId))
      return { ok: false, error: "cycle" };
  }

  const parentChanged = current.parentId !== input.parentId;
  const siblings = data.positions.filter(
    (position) =>
      position.parentId === input.parentId && position.id !== positionId,
  );
  const displayOrder = parentChanged
    ? siblings.length === 0
      ? 0
      : Math.max(...siblings.map((position) => position.displayOrder)) + 1
    : current.displayOrder;
  let next: OrganizationData = {
    ...data,
    positions: data.positions.map((position) =>
      position.id === positionId
        ? {
            ...position,
            title:
              positionId === data.rootPositionId
                ? position.title
                : input.title.trim(),
            titleTranslations:
              positionId === data.rootPositionId
                ? position.titleTranslations
                : input.title.trim() === position.title
                  ? position.titleTranslations
                  : undefined,
            department: input.department.trim() || undefined,
            departmentTranslations:
              input.department.trim() === (position.department ?? "")
                ? position.departmentTranslations
                : undefined,
            parentId:
              positionId === data.rootPositionId ? null : input.parentId,
            displayOrder,
          }
        : position,
    ),
  };
  next = withAssignment(next, positionId, input);
  return validateOrganization(next)
    ? { ok: true, data: next, positionId }
    : { ok: false, error: "invalid-data" };
}

export function deletePosition(
  data: OrganizationData,
  positionId: string,
): OrganizationResult {
  if (positionId === data.rootPositionId)
    return { ok: false, error: "root-delete" };
  if (!data.positions.some((position) => position.id === positionId))
    return { ok: false, error: "position-not-found" };
  if (data.positions.some((position) => position.parentId === positionId))
    return { ok: false, error: "has-children" };
  const next: OrganizationData = {
    ...data,
    positions: data.positions.filter((position) => position.id !== positionId),
    assignments: data.assignments.filter(
      (assignment) => assignment.positionId !== positionId,
    ),
  };
  return validateOrganization(next)
    ? { ok: true, data: next, positionId: data.rootPositionId }
    : { ok: false, error: "invalid-data" };
}
