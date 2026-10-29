import { AuthRequired } from "@/components/ui/status";
import { pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("authRequired");
}
export default function AuthenticationRequiredPage() {
  return <AuthRequired />;
}
