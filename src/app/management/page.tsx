import type { Metadata } from "next";
import { checkAccess } from "@/auth/access";
import { AuthRequired, EmptyState } from "@/components/ui/status";
export const metadata: Metadata = { title: "Management" };
export default async function ManagementPage() {
  const access = await checkAccess("management:view");
  if (access.result !== "allowed") return <AuthRequired next="/management" />;
  return (
    <>
      <div className="management-heading">
        <div>
          <h1>Overview</h1>
          <p>Welcome back, {access.session?.id}.</p>
        </div>
      </div>
      <EmptyState
        title="Management foundation is ready"
        detail="Modules and information will be added according to the next specification."
      />
    </>
  );
}
