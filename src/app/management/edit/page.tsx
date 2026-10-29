import { checkAccess } from "@/auth/access";
import { OrganizationEditor } from "@/components/management/organization-editor";
import { AccessDenied, AuthRequired } from "@/components/ui/status";
import { pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("managementEdit");
}
export default async function ManagementEditPage() {
  const access = await checkAccess("management:edit");
  if (access.result === "authentication-required")
    return <AuthRequired next="/management/edit" />;
  if (access.result === "access-denied") return <AccessDenied />;
  return <OrganizationEditor />;
}
