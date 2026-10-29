import { Suspense } from "react";
import { checkAccess } from "@/auth/access";
import { OrganizationView } from "@/components/management/organization-view";
import { AuthRequired } from "@/components/ui/status";
import { pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("management");
}
export default async function ManagementPage() {
  const access = await checkAccess("management:view");
  if (access.result !== "allowed") return <AuthRequired next="/management" />;
  return (
    <Suspense>
      <OrganizationView />
    </Suspense>
  );
}
