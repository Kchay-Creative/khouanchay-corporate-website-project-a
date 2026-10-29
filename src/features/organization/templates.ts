import { validateOrganization } from "./model";
import { rootPositionId } from "./seed";
import type { OrganizationData, Position } from "./types";

export const april2026TemplateName = "KCC-ORGCHART-Q2-2026";

const templatePositions: Position[] = [
  {
    id: "position-template-gm",
    title: "GM (General Manager)",
    unitType: "position",
    parentId: rootPositionId,
    displayOrder: 0,
  },
  {
    id: "position-template-operation-director",
    title: "OPERATION DIRECTOR",
    unitType: "position",
    parentId: "position-template-gm",
    displayOrder: 0,
  },
  {
    id: "position-template-indirect-procurement",
    title: "IN-DIRECT PROCUREMENT",
    unitType: "department",
    parentId: "position-template-operation-director",
    displayOrder: 0,
  },
  {
    id: "position-template-it",
    title: "IT",
    unitType: "department",
    parentId: "position-template-operation-director",
    displayOrder: 1,
  },
  {
    id: "position-template-data-governance",
    title: "DATA GOVERNANCE",
    unitType: "department",
    parentId: "position-template-operation-director",
    displayOrder: 2,
  },
  {
    id: "position-template-supply-chain",
    title: "SUPPLY CHAIN",
    unitType: "department",
    parentId: "position-template-operation-director",
    displayOrder: 3,
  },
  {
    id: "position-template-demand-forecast",
    title: "DEMAND FORECAST (PO)",
    unitType: "team",
    parentId: "position-template-supply-chain",
    displayOrder: 0,
  },
  {
    id: "position-template-shipping",
    title: "SHIPPING",
    unitType: "team",
    parentId: "position-template-supply-chain",
    displayOrder: 1,
  },
  {
    id: "position-template-warehouse",
    title: "WAREHOUSE",
    unitType: "team",
    parentId: "position-template-supply-chain",
    displayOrder: 2,
  },
  {
    id: "position-template-logistic",
    title: "LOGISTIC",
    unitType: "team",
    parentId: "position-template-supply-chain",
    displayOrder: 3,
  },
  {
    id: "position-template-fda",
    title: "FDA",
    unitType: "department",
    parentId: "position-template-gm",
    displayOrder: 1,
  },
  {
    id: "position-template-hr-director",
    title: "HR DIRECTOR",
    unitType: "position",
    parentId: "position-template-gm",
    displayOrder: 2,
  },
  {
    id: "position-template-hr",
    title: "HR",
    unitType: "department",
    parentId: "position-template-hr-director",
    displayOrder: 0,
  },
  {
    id: "position-template-admin",
    title: "ADMIN",
    unitType: "department",
    parentId: "position-template-hr-director",
    displayOrder: 1,
  },
  {
    id: "position-template-branches",
    title: "BRANCHES",
    unitType: "department",
    parentId: "position-template-hr-director",
    displayOrder: 2,
  },
  {
    id: "position-template-commercial",
    title: "COMMERCIAL",
    unitType: "department",
    parentId: "position-template-gm",
    displayOrder: 3,
  },
  {
    id: "position-template-sales-gt",
    title: "SALES GT",
    unitType: "team",
    parentId: "position-template-commercial",
    displayOrder: 0,
  },
  {
    id: "position-template-sales-mt",
    title: "SALES MT",
    unitType: "team",
    parentId: "position-template-commercial",
    displayOrder: 1,
  },
  {
    id: "position-template-trade-marketing",
    title: "TRADE MARKETING",
    unitType: "department",
    parentId: "position-template-commercial",
    displayOrder: 2,
  },
  {
    id: "position-template-sales-trade-admin",
    title: "SALES AND TRADE ADMIN",
    unitType: "department",
    parentId: "position-template-commercial",
    displayOrder: 3,
  },
  {
    id: "position-template-sales-performance",
    title: "SALES PERFORMANCE EXCELLENCE",
    unitType: "team",
    parentId: "position-template-commercial",
    displayOrder: 4,
  },
  {
    id: "position-template-cfo",
    title: "CFO",
    unitType: "position",
    parentId: "position-template-gm",
    displayOrder: 4,
  },
  {
    id: "position-template-accounting",
    title: "ACCOUNTING",
    unitType: "department",
    parentId: "position-template-cfo",
    displayOrder: 0,
  },
  {
    id: "position-template-finance",
    title: "FINANCE",
    unitType: "department",
    parentId: "position-template-cfo",
    displayOrder: 1,
  },
  {
    id: "position-template-finance-operation-manager",
    title: "FINANCE OPERATION MANAGER",
    unitType: "position",
    parentId: "position-template-cfo",
    displayOrder: 2,
  },
  {
    id: "position-template-strategic-assistant",
    title: "STRATEGIC ASSISTANT TO KCC CEO",
    unitType: "position",
    parentId: "position-template-gm",
    displayOrder: 5,
  },
  {
    id: "position-template-assist-ceo",
    title: "ASSIST TO CEO",
    unitType: "position",
    parentId: "position-template-strategic-assistant",
    displayOrder: 0,
  },
  {
    id: "position-template-business-analysis",
    title: "BUSINESS ANALYSIS",
    unitType: "team",
    parentId: "position-template-strategic-assistant",
    displayOrder: 1,
  },
  {
    id: "position-template-bd-china",
    title: "BD-CHINA",
    unitType: "team",
    parentId: "position-template-strategic-assistant",
    displayOrder: 2,
  },
  {
    id: "position-template-bd-new-business",
    title: "BD-KCC NEW BUSINESS",
    unitType: "team",
    parentId: "position-template-strategic-assistant",
    displayOrder: 3,
  },
];

function positionsForRoot(rootId: string): Position[] {
  return templatePositions.map((position) => ({
    ...position,
    parentId:
      position.parentId === rootPositionId ? rootId : position.parentId,
  }));
}

export function createApril2026TemplatePreview(
  data: OrganizationData,
): OrganizationData {
  const root = data.positions.find(
    (position) => position.id === data.rootPositionId,
  );
  if (!root) return data;

  const rootAssignment = data.assignments.find(
    (assignment) =>
      assignment.positionId === data.rootPositionId &&
      assignment.effectiveTo === null,
  );
  const rootPerson = rootAssignment
    ? data.people.find((person) => person.id === rootAssignment.personId)
    : null;

  return {
    ...data,
    positions: [{ ...root }, ...positionsForRoot(data.rootPositionId)],
    people: rootPerson ? [{ ...rootPerson }] : [],
    assignments:
      rootAssignment && rootPerson ? [{ ...rootAssignment }] : [],
  };
}

export function importApril2026Template(data: OrganizationData):
  | { ok: true; data: OrganizationData; addedCount: number }
  | { ok: false } {
  const existingIds = new Set(data.positions.map((position) => position.id));
  const additions = positionsForRoot(data.rootPositionId).filter(
    (position) => !existingIds.has(position.id),
  );
  const next: OrganizationData = {
    ...data,
    positions: [...data.positions, ...additions],
  };

  return validateOrganization(next)
    ? { ok: true, data: next, addedCount: additions.length }
    : { ok: false };
}
