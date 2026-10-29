import { checkAccess } from "@/auth/access";
import { BrandAdmin } from "@/components/brands/brand-admin";
import { AccessDenied, AuthRequired } from "@/components/ui/status";
import { pageMetadata } from "@/i18n/server";

export async function generateMetadata() {
  return pageMetadata("brandsManagement");
}

export default async function BrandManagementPage() {
  const access = await checkAccess("brands:manage");
  if (access.result === "authentication-required")
    return <AuthRequired next="/management/brands" />;
  if (access.result === "access-denied") return <AccessDenied />;
  return <BrandAdmin />;
}
