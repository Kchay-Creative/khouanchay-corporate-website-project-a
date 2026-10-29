import type { OrganizationData, Position } from "./types";

export const rootPositionId = "position-ceo";
export const organizationContentRevision = 2;

const ceoProfile = {
  displayName: "Manivone Sitthixay",
  positionTitle: "President of KCC",
  department: "Operations Department",
  imageUrl: "/organization/manivone-sitthixay.png",
} as const;

export function createInitialOrganization(): OrganizationData {
  return {
    schemaVersion: 1,
    contentRevision: organizationContentRevision,
    rootPositionId,
    positions: [
      {
        id: rootPositionId,
        title: ceoProfile.positionTitle,
        titleTranslations: {
          lo: ceoProfile.positionTitle,
          en: ceoProfile.positionTitle,
        },
        department: ceoProfile.department,
        departmentTranslations: {
          lo: ceoProfile.department,
          en: ceoProfile.department,
        },
        unitType: "position",
        parentId: null,
        displayOrder: 0,
      },
    ],
    people: [
      {
        id: "person-demo-ceo",
        displayName: ceoProfile.displayName,
        imageUrl: ceoProfile.imageUrl,
        isDemonstration: false,
      },
    ],
    assignments: [
      {
        id: "assignment-demo-1",
        positionId: rootPositionId,
        personId: "person-demo-ceo",
        effectiveFrom: null,
        effectiveTo: null,
      },
    ],
  };
}

const positions: Position[] = [
  {
    id: rootPositionId,
    title: ceoProfile.positionTitle,
    titleTranslations: {
      lo: ceoProfile.positionTitle,
      en: ceoProfile.positionTitle,
    },
    department: ceoProfile.department,
    departmentTranslations: {
      lo: ceoProfile.department,
      en: ceoProfile.department,
    },
    parentId: null,
    displayOrder: 0,
  },
  {
    id: "position-gm-operations",
    title: "General Manager, Operations",
    titleTranslations: {
      lo: "ຜູ້ຈັດການໃຫຍ່ ຝ່າຍປະຕິບັດການ",
      en: "General Manager, Operations",
    },
    parentId: rootPositionId,
    displayOrder: 0,
  },
  {
    id: "position-gm-commerce",
    title: "General Manager, Commerce",
    titleTranslations: {
      lo: "ຜູ້ຈັດການໃຫຍ່ ຝ່າຍການຄ້າ",
      en: "General Manager, Commerce",
    },
    parentId: rootPositionId,
    displayOrder: 1,
  },
  {
    id: "position-gm-corporate-services",
    title: "General Manager, Corporate Services",
    titleTranslations: {
      lo: "ຜູ້ຈັດການໃຫຍ່ ຝ່າຍບໍລິການອົງກອນ",
      en: "General Manager, Corporate Services",
    },
    parentId: rootPositionId,
    displayOrder: 2,
  },
  {
    id: "position-operations-manager",
    title: "Operations Manager",
    titleTranslations: {
      lo: "ຜູ້ຈັດການຝ່າຍປະຕິບັດການ",
      en: "Operations Manager",
    },
    parentId: "position-gm-operations",
    displayOrder: 0,
  },
  {
    id: "position-logistics-manager",
    title: "Logistics Manager",
    titleTranslations: {
      lo: "ຜູ້ຈັດການຝ່າຍໂລຈິສຕິກ",
      en: "Logistics Manager",
    },
    parentId: "position-gm-operations",
    displayOrder: 1,
  },
  {
    id: "position-sales-manager",
    title: "Sales Manager",
    titleTranslations: {
      lo: "ຜູ້ຈັດການຝ່າຍຂາຍ",
      en: "Sales Manager",
    },
    parentId: "position-gm-commerce",
    displayOrder: 0,
  },
  {
    id: "position-marketing-manager",
    title: "Marketing Manager",
    titleTranslations: {
      lo: "ຜູ້ຈັດການຝ່າຍການຕະຫຼາດ",
      en: "Marketing Manager",
    },
    parentId: "position-gm-commerce",
    displayOrder: 1,
  },
  {
    id: "position-hr-manager",
    title: "HR Manager",
    titleTranslations: {
      lo: "ຜູ້ຈັດການຝ່າຍຊັບພະຍາກອນມະນຸດ",
      en: "HR Manager",
    },
    parentId: "position-gm-corporate-services",
    displayOrder: 0,
  },
  {
    id: "position-finance-manager",
    title: "Finance Manager",
    titleTranslations: {
      lo: "ຜູ້ຈັດການຝ່າຍການເງິນ",
      en: "Finance Manager",
    },
    parentId: "position-gm-corporate-services",
    displayOrder: 1,
  },
];

const names = [
  ceoProfile.displayName,
  "Demo Person A",
  "Demo Person B",
  "Demo Person C",
  "Demo Person D",
  "Demo Person E",
  "Demo Person F",
  "Demo Person G",
  "Demo Person H",
  "Demo Person I",
];

const positionIds = positions.map((position) => position.id);

export function createDemoOrganization(): OrganizationData {
  return {
    schemaVersion: 1,
    contentRevision: organizationContentRevision,
    rootPositionId,
    positions: positions.map((position) => ({
      ...position,
      titleTranslations: position.titleTranslations
        ? { ...position.titleTranslations }
        : undefined,
      departmentTranslations: position.departmentTranslations
        ? { ...position.departmentTranslations }
        : undefined,
    })),
    people: names.map((displayName, index) => ({
      id: index === 0 ? "person-demo-ceo" : `person-demo-${index}`,
      displayName,
      imageUrl: index === 0 ? ceoProfile.imageUrl : undefined,
      isDemonstration: index !== 0,
    })),
    assignments: positionIds.map((positionId, index) => ({
      id: `assignment-demo-${index + 1}`,
      positionId,
      personId: index === 0 ? "person-demo-ceo" : `person-demo-${index}`,
      effectiveFrom: null,
      effectiveTo: null,
    })),
  };
}

export function migrateOrganizationContent(
  data: OrganizationData,
): OrganizationData {
  if ((data.contentRevision ?? 0) >= organizationContentRevision)
    return data;

  const root = data.positions.find(
    (position) => position.id === data.rootPositionId,
  );
  const rootAssignment = data.assignments.find(
    (assignment) =>
      assignment.positionId === data.rootPositionId &&
      assignment.effectiveTo === null,
  );

  if (!root || !rootAssignment) {
    return { ...data, contentRevision: organizationContentRevision };
  }

  const personIsShared = data.assignments.some(
    (assignment) =>
      assignment.personId === rootAssignment.personId &&
      assignment.positionId !== data.rootPositionId &&
      assignment.effectiveTo === null,
  );
  const dedicatedPersonId = personIsShared
    ? data.people.some((person) => person.id === "person-president-manivone")
      ? `person-president-manivone-${Date.now()}`
      : "person-president-manivone"
    : rootAssignment.personId;

  const nextPeople = personIsShared
    ? [
        ...data.people,
        {
          id: dedicatedPersonId,
          displayName: ceoProfile.displayName,
          imageUrl: ceoProfile.imageUrl,
          isDemonstration: false,
        },
      ]
    : data.people.map((person) =>
        person.id === rootAssignment.personId
          ? {
              ...person,
              displayName: ceoProfile.displayName,
              imageUrl: ceoProfile.imageUrl,
              isDemonstration: false,
            }
          : person,
      );

  return {
    ...data,
    contentRevision: organizationContentRevision,
    positions: data.positions.map((position) =>
      position.id === data.rootPositionId
        ? {
            ...position,
            title: ceoProfile.positionTitle,
            titleTranslations: {
              lo: ceoProfile.positionTitle,
              en: ceoProfile.positionTitle,
            },
            department: ceoProfile.department,
            departmentTranslations: {
              lo: ceoProfile.department,
              en: ceoProfile.department,
            },
          }
        : position,
    ),
    people: nextPeople,
    assignments: personIsShared
      ? data.assignments.map((assignment) =>
          assignment.id === rootAssignment.id
            ? { ...assignment, personId: dedicatedPersonId }
            : assignment,
        )
      : data.assignments,
  };
}
