import Link from "next/link";
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
export function Placeholder({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="placeholder-block">
      <span className="placeholder-label">Content placeholder</span>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}
export function SimpleCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <article className="simple-card">
      <h3>{title}</h3>
      <p>{text}</p>
      {href ? (
        <Link className="inline-link" href={href}>
          Learn more <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </article>
  );
}
