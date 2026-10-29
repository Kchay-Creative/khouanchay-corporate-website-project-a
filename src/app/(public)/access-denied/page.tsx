import { AccessDenied } from "@/components/ui/status";
import { pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("accessDenied");
}
export default function AccessDeniedPage() {
  return <AccessDenied />;
}
