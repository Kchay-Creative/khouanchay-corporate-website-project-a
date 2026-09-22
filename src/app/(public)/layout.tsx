import { getSession } from "@/auth/session";
import { publicNavigation, visibleNavigation } from "@/config/navigation";
import { PublicShell } from "@/components/public/public-shell";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <PublicShell
      items={visibleNavigation(publicNavigation, session?.role ?? "guest")}
      account={session?.id ?? null}
    >
      {children}
    </PublicShell>
  );
}
