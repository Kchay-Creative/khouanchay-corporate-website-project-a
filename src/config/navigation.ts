import type { Permission, Role } from "@/permissions";
import { can } from "@/permissions";

export type NavItem = {
  label: string;
  href: string;
  permission?: Permission;
  children?: NavItem[];
};
export const publicNavigation: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Company", href: "/company" },
  { label: "Business", href: "/business" },
  { label: "Brands", href: "/brands" },
  { label: "News", href: "/news" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Management", href: "/management", permission: "management:view" },
  {
    label: "Management Administration",
    href: "/management/edit",
    permission: "management:edit",
  },
];
export const managementNavigation: NavItem[] = [
  { label: "Overview", href: "/management", permission: "management:view" },
  {
    label: "Administration",
    href: "/management/edit",
    permission: "management:edit",
  },
];
export function visibleNavigation(
  items: readonly NavItem[],
  role: Role,
): NavItem[] {
  return items
    .filter((item) => !item.permission || can(role, item.permission))
    .map((item) => ({
      ...item,
      children: item.children
        ? visibleNavigation(item.children, role)
        : undefined,
    }));
}
