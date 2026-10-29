import Link from "next/link";
import { getI18n } from "@/i18n/server";
import { formatMessage } from "@/i18n";

export async function PublicFooter() {
  const { dictionary: d } = await getI18n();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>Khouanchay Trading</strong>
          <p>{d.footer.tagline}</p>
        </div>
        <div className="footer-links">
          <Link href="/home#company">{d.nav.company}</Link>
          <Link href="/home#business">{d.nav.business}</Link>
          <Link href="/careers">{d.nav.careers}</Link>
          <Link href="/home#contact">{d.nav.contact}</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        {formatMessage(d.footer.legal, { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
