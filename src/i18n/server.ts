import "server-only";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { defaultLocale, isLocale, localeCookie } from "./config";
import { getDictionary } from "./index";

export const getI18n = cache(async () => {
  const saved = (await cookies()).get(localeCookie)?.value;
  const locale = isLocale(saved) ? saved : defaultLocale;
  return { locale, dictionary: getDictionary(locale) };
});

type PageKey =
  | "home"
  | "company"
  | "business"
  | "brands"
  | "news"
  | "careers"
  | "contact"
  | "login"
  | "management"
  | "managementEdit"
  | "brandsManagement"
  | "authRequired"
  | "accessDenied"
  | "notFound";

export async function pageMetadata(page: PageKey): Promise<Metadata> {
  const { dictionary: d } = await getI18n();
  const titles: Record<PageKey, string> = {
    home: d.nav.home,
    company: d.company.title,
    business: d.business.title,
    brands: d.brands.title,
    news: d.news.title,
    careers: d.careers.title,
    contact: d.contact.title,
    login: d.login.title,
    management: d.organization.pageTitle,
    managementEdit: d.organization.editTitle,
    brandsManagement: d.brandAdmin.title,
    authRequired: d.status.authTitle,
    accessDenied: d.status.deniedTitle,
    notFound: d.status.notFoundTitle,
  };
  return { title: titles[page], description: d.meta.siteDescription };
}
