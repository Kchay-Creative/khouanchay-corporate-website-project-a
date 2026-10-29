import { checkAccess } from "@/auth/access";
import { managementNavigation, visibleNavigation } from "@/config/navigation";
import { AuthRequired, AccessDenied } from "@/components/ui/status";
import { ManagementShell } from "@/components/management/management-shell";

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await checkAccess("management:view");
  if (access.result === "authentication-required")
    return <AuthRequired next="/management" />;
  if (access.result === "access-denied" || !access.session)
    return <AccessDenied />;
  return (
    <ManagementShell
      items={visibleNavigation(managementNavigation, access.session.role)}
    >
      {children}
    </ManagementShell>
  );
}
