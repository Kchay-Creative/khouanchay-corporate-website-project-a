import type { Metadata } from "next";
import { getSession } from "@/auth/session";
import { globalNavigation, visibleNavigation } from "@/config/navigation";
import { GlobalNavbar } from "@/components/navigation/global-navbar";
import { I18nProvider } from "@/i18n/provider";
import { getI18n } from "@/i18n/server";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export async function generateMetadata(): Promise<Metadata> {
  const { dictionary: d } = await getI18n();
  return {
    title: {
      default: "Khouanchay Trading",
      template: "%s | Khouanchay Trading",
    },
    description: d.meta.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const { locale, dictionary } = await getI18n();
  const role = session?.role ?? "guest";
  return (
    <html lang={locale} className={cn("font-sans", geist.variable)}>
      <body>
        <I18nProvider locale={locale} dictionary={dictionary}>
          <div className="app-frame">
            <GlobalNavbar
              items={visibleNavigation(globalNavigation, role)}
              account={
                session
                  ? {
                      name: null,
                      email: session.id.includes("@") ? session.id : null,
                      role: session.role,
                    }
                  : null
              }
            />
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
