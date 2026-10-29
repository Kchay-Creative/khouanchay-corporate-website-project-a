import Link from "next/link";

import { BrandsDirectory } from "@/components/brands/brands-directory";
import { formatMessage, type Dictionary } from "@/i18n";

import { ContentSection, Placeholder, SimpleCard } from "./sections";

function SectionHero({
  title,
  description,
  titleId,
}: {
  title: string;
  description: string;
  titleId: string;
}) {
  return (
    <header className="page-hero combined-section-hero">
      <div className="container">
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

export function CompanyHomeSection({
  dictionary: d,
}: {
  dictionary: Dictionary;
}) {
  const c = d.company;

  return (
    <section
      id="company"
      className="home-scroll-section home-combined-section"
      aria-labelledby="company-section-title"
    >
      <SectionHero
        title={c.title}
        description={c.intro}
        titleId="company-section-title"
      />
      <ContentSection title={c.overviewTitle}>
        <Placeholder title={c.overview} detail={c.overviewBody} />
      </ContentSection>
      <ContentSection title={c.storyTitle} className="section-tint">
        <Placeholder title={c.history} detail={c.historyBody} />
      </ContentSection>
      <ContentSection title={c.visionMissionTitle}>
        <div className="two-grid">
          <Placeholder title={c.vision} detail={c.visionBody} />
          <Placeholder title={c.mission} detail={c.missionBody} />
        </div>
      </ContentSection>
      <ContentSection title={c.valuesTitle} className="section-tint">
        <Placeholder title={c.values} detail={c.valuesBody} />
      </ContentSection>
      <ContentSection title={c.timelineTitle}>
        <Placeholder title={c.milestones} detail={c.milestonesBody} />
      </ContentSection>
      <ContentSection title={c.leadershipTitle} className="section-tint">
        <Placeholder title={c.leadershipTitle} detail={c.leadershipBody} />
      </ContentSection>
      <ContentSection title={c.organizationTitle}>
        <Placeholder title={c.structure} detail={c.structureBody} />
      </ContentSection>
    </section>
  );
}

export function BusinessHomeSection({
  dictionary: d,
}: {
  dictionary: Dictionary;
}) {
  const c = d.business;

  return (
    <section
      id="business"
      className="home-scroll-section home-combined-section"
      aria-labelledby="business-section-title"
    >
      <SectionHero
        title={c.title}
        description={c.intro}
        titleId="business-section-title"
      />
      <ContentSection title={c.areasTitle}>
        <div className="three-grid">
          {[1, 2, 3].map((number) => (
            <SimpleCard
              key={number}
              title={formatMessage(c.area, { number: `0${number}` })}
              text={c.areaBody}
            />
          ))}
        </div>
      </ContentSection>
      <ContentSection title={c.detailsTitle} className="section-tint">
        <Placeholder title={c.operations} detail={c.operationsBody} />
      </ContentSection>
      <section className="simple-cta">
        <div className="container split">
          <div>
            <h2>{c.ctaTitle}</h2>
            <p>{c.ctaBody}</p>
          </div>
          <Link className="button button-primary" href="/home#contact">
            {c.contactUs}
          </Link>
        </div>
      </section>
    </section>
  );
}

export function BrandsHomeSection({
  dictionary: d,
}: {
  dictionary: Dictionary;
}) {
  const c = d.brands;

  return (
    <section
      id="brands"
      className="home-scroll-section home-combined-section brands-page"
      aria-labelledby="brands-section-title"
    >
      <SectionHero
        title={c.title}
        description={c.intro}
        titleId="brands-section-title"
      />
      <BrandsDirectory />
    </section>
  );
}

export function ContactHomeSection({
  dictionary: d,
}: {
  dictionary: Dictionary;
}) {
  const c = d.contact;

  return (
    <section
      id="contact"
      className="home-scroll-section home-combined-section"
      aria-labelledby="contact-section-title"
    >
      <SectionHero
        title={c.title}
        description={c.intro}
        titleId="contact-section-title"
      />
      <ContentSection title={c.infoTitle}>
        <div className="three-grid">
          {[c.address, c.phone, c.email].map((label) => (
            <div className="info-tile" key={label}>
              <h3>{label}</h3>
              <p>{c.detailsPending}</p>
            </div>
          ))}
        </div>
      </ContentSection>
      <ContentSection title={c.mapTitle} className="section-tint">
        <div className="contact-map">
          <iframe
            className="contact-map-frame"
            src="https://www.google.com/maps?q=17.9447352%2C102.6438785&z=17&output=embed"
            title={c.mapFrameTitle}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="contact-map-footer">
            <p>{c.mapLocationName}</p>
            <a
              className="button button-primary"
              href="https://maps.app.goo.gl/q7koUSNJakRdbYLt5"
              target="_blank"
              rel="noopener noreferrer"
            >
              {c.openInGoogleMaps}
            </a>
          </div>
        </div>
      </ContentSection>
      <ContentSection title={c.formTitle}>
        <div className="form-placeholder">
          <p className="notice">{c.formNotice}</p>
          <div className="form-grid">
            <label>
              {c.name}
              <input disabled placeholder={c.name} />
            </label>
            <label>
              {c.email}
              <input disabled placeholder={c.email} />
            </label>
            <label>
              {c.phone}
              <input disabled placeholder={c.phone} />
            </label>
            <label>
              {c.subject}
              <input disabled placeholder={c.subject} />
            </label>
            <label className="full-width">
              {c.message}
              <textarea disabled placeholder={c.message} rows={5} />
            </label>
          </div>
          <button className="button button-primary" disabled>
            {c.send}
          </button>
        </div>
      </ContentSection>
      <ContentSection title={c.branchesTitle} className="section-tint">
        <Placeholder title={c.locations} detail={c.locationsBody} />
      </ContentSection>
    </section>
  );
}
