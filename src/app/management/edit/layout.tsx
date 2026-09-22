import { checkAccess } from "@/auth/access";
import { AccessDenied, AuthRequired } from "@/components/ui/status";
export default async function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await checkAccess("management:edit");
  if (access.result === "authentication-required")
    return <AuthRequired next="/management/edit" />;
  if (access.result === "access-denied") return <AccessDenied />;
  return children;
}
