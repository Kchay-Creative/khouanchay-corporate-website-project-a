export type ChartView = {
  id: string;
  nameLo: string;
  nameEn: string;
  slug: string;
  parentViewId: string | null;
  rootPositionId: string;
  order: number;
  isDefault: boolean;
  isActive: boolean;
};

export type ChartViewMembership = {
  viewId: string;
  positionId: string;
};

export type ChartViewLink = {
  sourceViewId: string;
  sourcePositionId: string;
  targetViewId: string;
};

export type ChartViewData = {
  schemaVersion: 1;
  views: ChartView[];
  memberships: ChartViewMembership[];
  links: ChartViewLink[];
};

export type ChartViewError =
  | "name-required"
  | "view-not-found"
  | "position-not-found"
  | "parent-view-not-found"
  | "view-cycle"
  | "default-protected"
  | "root-membership-protected"
  | "invalid-data";

export type ChartViewResult =
  | { ok: true; data: ChartViewData; viewId: string }
  | { ok: false; error: ChartViewError };
