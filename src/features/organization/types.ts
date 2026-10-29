import type { Locale } from "@/i18n";

export type OrganizationUnitType = "position" | "department" | "team";

export type Position = {
  id: string;
  title: string;
  titleTranslations?: Partial<Record<Locale, string>>;
  department?: string;
  departmentTranslations?: Partial<Record<Locale, string>>;
  unitType?: OrganizationUnitType;
  parentId: string | null;
  displayOrder: number;
};

export type Person = {
  id: string;
  displayName: string;
  imageUrl?: string | null;
  biographyTranslations?: Partial<Record<Locale, string>>;
  isDemonstration: boolean;
};

export type PositionAssignment = {
  id: string;
  positionId: string;
  personId: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
};

export type OrganizationData = {
  schemaVersion: 1;
  contentRevision?: number;
  rootPositionId: string;
  positions: Position[];
  people: Person[];
  assignments: PositionAssignment[];
};

export type OrganizationTreeNode = {
  position: Position;
  person: Person | null;
  children: OrganizationTreeNode[];
};

export type OrganizationError =
  | "title-required"
  | "parent-required"
  | "position-not-found"
  | "parent-not-found"
  | "self-parent"
  | "cycle"
  | "root-parent"
  | "root-delete"
  | "has-children"
  | "invalid-data";

export type OrganizationResult =
  | { ok: true; data: OrganizationData; positionId: string }
  | { ok: false; error: OrganizationError };
