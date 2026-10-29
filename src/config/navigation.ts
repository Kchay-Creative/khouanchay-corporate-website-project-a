import type { Permission, Role } from "@/permissions";
import { can, isAuthenticated } from "@/permissions";
import type { Dictionary } from "@/i18n";

export type NavItem = {
  labelKey: keyof Dictionary["nav"];
  href: string;
  sectionId?: "home" | "company" | "business" | "brands" | "contact";
  permission?: Permission;
  guestOnly?: boolean;
  children?: NavItem[];
};

export const globalNavigation: NavItem[] = [
  { labelKey: "home", href: "/home", sectionId: "home" },
  { labelKey: "company", href: "/home#company", sectionId: "company" },
  { labelKey: "business", href: "/home#business", sectionId: "business" },
  { labelKey: "brands", href: "/home#brands", sectionId: "brands" },
  { labelKey: "news", href: "/news" },
  { labelKey: "careers", href: "/careers" },
  { labelKey: "contact", href: "/home#contact", sectionId: "contact" },
  {
    labelKey: "management",
    href: "/management",
    permission: "management:view",
  },
];

export const managementNavigation: NavItem[] = [
  { labelKey: "overview", href: "/management", permission: "management:view" },
  {
    labelKey: "administration",
    href: "/management/edit",
    permission: "management:edit",
  },
  {
    labelKey: "brandManagement",
    href: "/management/brands",
    permission: "brands:manage",
  },
];

export function visibleNavigation(
  items: readonly NavItem[],
  role: Role,
): NavItem[] {
  return items
    .filter(
      (item) =>
        (!item.permission || can(role, item.permission)) &&
        (!item.guestOnly || !isAuthenticated(role)),
    )
    .map((item) => ({
      ...item,
      children: item.children
        ? visibleNavigation(item.children, role)
        : undefined,
    }));
}
