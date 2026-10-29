import Image from "next/image";
import Link from "next/link";
import {
  BrandsHomeSection,
  BusinessHomeSection,
  CompanyHomeSection,
  ContactHomeSection,
} from "@/components/public/home-sections";
import { formatMessage } from "@/i18n";
import { getI18n, pageMetadata } from "@/i18n/server";

export async function generateMetadata() {
  return pageMetadata("home");
}

type StrengthIconName = "network" | "operations" | "people" | "growth";

function StrengthIcon({ name }: { name: StrengthIconName }) {
  if (name === "network") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="8" cy="16" r="3.5" />
        <circle cx="24" cy="8" r="3.5" />
        <circle cx="24" cy="24" r="3.5" />
        <path d="m11 14.5 9.5-4.8M11 17.5l9.5 4.8" />
      </svg>
    );
  }

  if (name === "operations") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 10.5 16 5l11 5.5v11L16 27 5 21.5z" />
        <path d="m5 10.5 11 5.6 11-5.6M16 16.1V27" />
      </svg>
    );
  }

  if (name === "people") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="10" r="4" />
        <path d="M8.5 26v-2.5a7.5 7.5 0 0 1 15 0V26M6 13.5a3.5 3.5 0 0 0 0 7M26 13.5a3.5 3.5 0 0 1 0 7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 25 14 17l5 4 7-9" />
      <path d="M20 12h6v6" />
      <path d="M6 7v18h20" />
    </svg>
  );
}

export default async function HomePage() {
  const { dictionary: d } = await getI18n();
  const copy = d.home;

  const businessCards = ["01", "02", "03"].map((number) => ({
    number,
    title: formatMessage(copy.businessArea, { number }),
  }));

  const strengths: Array<{
    icon: StrengthIconName;
    title: string;
    body: string;
  }> = [
    {
      icon: "network",
      title: copy.strengthNetworkTitle,
      body: copy.strengthNetworkBody,
    },
    {
      icon: "operations",
      title: copy.strengthOperationsTitle,
      body: copy.strengthOperationsBody,
    },
    {
      icon: "people",
      title: copy.strengthPeopleTitle,
      body: copy.strengthPeopleBody,
    },
    {
      icon: "growth",
      title: copy.strengthGrowthTitle,
      body: copy.strengthGrowthBody,
    },
  ];

  const newsImages = [
    "/home/company-activity-01.jpg",
    "/home/company-activity-02.jpg",
    "/home/company-activity-03.jpg",
  ];

  return (
    <main className="kcc-home">
      <section
        id="home"
        className="home-scroll-section home-landing-section"
        aria-labelledby="home-section-title"
      >
        <section className="kcc-home-hero">
          <Image
            className="kcc-home-hero-image"
            src="/home/kcc-headquarters.jpg"
            alt={copy.heroImageAlt}
            fill
            priority
            sizes="100vw"
          />
          <div className="kcc-home-hero-overlay" aria-hidden="true" />
          <div className="container kcc-home-hero-content">
            <p className="kcc-home-eyebrow">{copy.eyebrow}</p>
            <h1 id="home-section-title">{copy.heroTitle}</h1>
            <p className="kcc-home-hero-intro">{copy.heroIntro}</p>
            <div className="kcc-home-hero-actions">
              <Link
                className="kcc-home-button kcc-home-button-primary"
                href="/home#company"
              >
                {copy.aboutUs}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                className="kcc-home-button kcc-home-button-light"
                href="/home#contact"
              >
                {copy.contactUs}
              </Link>
            </div>
          </div>
        </section>

        <section
          className="kcc-home-business"
          aria-labelledby="home-business-title"
        >
          <div className="container">
            <div className="kcc-home-business-heading">
              <p className="kcc-home-section-label">{copy.businessLabel}</p>
              <h2 id="home-business-title">{copy.businessTitle}</h2>
            </div>
            <div className="kcc-home-business-grid">
              {businessCards.map((card) => (
                <Link
                  className="kcc-home-business-card"
                  href="/home#business"
                  key={card.number}
                >
                  <div className="kcc-home-card-meta">
                    <span className="kcc-home-card-number">{card.number}</span>
                    <span className="kcc-home-placeholder-label">
                      {copy.placeholderLabel}
                    </span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{copy.businessDetail}</p>
                  <span className="kcc-home-card-link">
                    {copy.exploreBusiness} <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          className="kcc-home-strengths"
          aria-labelledby="home-strengths-title"
        >
          <div className="container">
            <div className="kcc-home-section-heading">
              <p className="kcc-home-section-label">{copy.strengthsLabel}</p>
              <h2 id="home-strengths-title">{copy.strengthsTitle}</h2>
              <p>{copy.strengthsIntro}</p>
            </div>
            <div className="kcc-home-strengths-grid">
              {strengths.map((strength) => (
                <article className="kcc-home-strength" key={strength.title}>
                  <div className="kcc-home-strength-icon">
                    <StrengthIcon name={strength.icon} />
                  </div>
                  <h3>{strength.title}</h3>
                  <p>{strength.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="kcc-home-news" aria-labelledby="home-news-title">
          <div className="container">
            <div className="kcc-home-news-heading">
              <div>
                <p className="kcc-home-section-label">{copy.newsLabel}</p>
                <h2 id="home-news-title">{copy.latestNews}</h2>
                <p>{copy.newsIntro}</p>
              </div>
              <Link className="kcc-home-news-all" href="/news">
                {copy.viewAllNews} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="kcc-home-news-grid">
              {newsImages.map((src, index) => (
                <Link className="kcc-home-news-card" href="/news" key={src}>
                  <div className="kcc-home-news-image-wrap">
                    <Image
                      className="kcc-home-news-image"
                      src={src}
                      alt={formatMessage(copy.activityImageAlt, {
                        number: String(index + 1),
                      })}
                      fill
                      sizes="(max-width: 760px) 100vw, (max-width: 1040px) 50vw, 33vw"
                    />
                  </div>
                  <div className="kcc-home-news-copy">
                    <span className="kcc-home-placeholder-label">
                      {copy.placeholderLabel}
                    </span>
                    <h3>
                      {formatMessage(copy.newsItem, {
                        number: String(index + 1).padStart(2, "0"),
                      })}
                    </h3>
                    <p>{copy.newsBody}</p>
                    <span className="kcc-home-card-link">
                      {copy.readMore} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
      <CompanyHomeSection dictionary={d} />
      <BusinessHomeSection dictionary={d} />
      <BrandsHomeSection dictionary={d} />
      <ContactHomeSection dictionary={d} />
    </main>
  );
}
