import Link from "next/link";
import { getI18n } from "@/i18n/server";
export function PageHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
export function ContentSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`content-section ${className}`}>
      <div className="container">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}
export async function Placeholder({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  const { dictionary: d } = await getI18n();
  return (
    <div className="placeholder-block">
      <span className="placeholder-label">{d.common.placeholder}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}
export async function SimpleCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href?: string;
}) {
  const { dictionary: d } = await getI18n();
  return (
    <article className="simple-card">
      <h3>{title}</h3>
      <p>{text}</p>
      {href ? (
        <Link className="inline-link" href={href}>
          {d.common.learnMore} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </article>
  );
}
