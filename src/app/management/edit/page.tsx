import type { Metadata } from "next";
import { checkAccess } from "@/auth/access";
import { AccessDenied, AuthRequired, EmptyState } from "@/components/ui/status";
export const metadata: Metadata = { title: "Management Administration" };
export default async function ManagementEditPage() {
  const access = await checkAccess("management:edit");
  if (access.result === "authentication-required")
    return <AuthRequired next="/management/edit" />;
  if (access.result === "access-denied") return <AccessDenied />;
  return (
    <>
      <div className="management-heading">
        <div>
          <span className="mode-label">Administration mode</span>
          <h1>Management Administration</h1>
          <p>
            Editing tools will be added after Management requirements are
            defined.
          </p>
        </div>
      </div>
      <EmptyState
        title="No administration modules yet"
        detail="This area is reserved for Admin-only Management editing functions."
      />
    </>
  );
}
