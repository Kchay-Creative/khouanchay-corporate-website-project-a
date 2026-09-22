import Link from "next/link";
import {
  ContentSection,
  Placeholder,
  SimpleCard,
} from "@/components/public/sections";
export default function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <div className="container hero-grid">
          <div>
            <h1>Khouanchay Trading</h1>
            <p>
              A corporate home for our company, businesses, brands, people, and
              future opportunities.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/company">
                Learn More
              </Link>
              <Link className="button button-outline" href="/business">
                Our Business
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-label="Company visual placeholder">
            <div className="visual-monogram">K</div>
            <span>Company visual pending approved brand assets</span>
          </div>
        </div>
      </section>
      <ContentSection title="About Khouanchay">
        <div className="split">
          <p>
            Company overview and introduction will be added after the official
            company profile is supplied.
          </p>
          <Link className="inline-link" href="/company">
            Read More →
          </Link>
        </div>
      </ContentSection>
      <ContentSection title="Our Business" className="section-tint">
        <div className="three-grid">
          <SimpleCard
            title="Business area 01"
            text="Business details to be confirmed."
            href="/business"
          />
          <SimpleCard
            title="Business area 02"
            text="Business details to be confirmed."
            href="/business"
          />
          <SimpleCard
            title="Business area 03"
            text="Business details to be confirmed."
            href="/business"
          />
        </div>
      </ContentSection>
      <ContentSection title="Company Highlights">
        <div className="four-grid">
          {["Years", "Employees", "Brands / Partners", "Locations"].map(
            (label) => (
              <div className="stat-placeholder" key={label}>
                <strong>—</strong>
                <span>{label}</span>
                <small>Awaiting verified figure</small>
              </div>
            ),
          )}
        </div>
      </ContentSection>
      <ContentSection title="Brands & Partners" className="section-tint">
        <Placeholder
          title="Brand directory"
          detail="Approved brand names and logos will appear here."
        />
        <Link className="inline-link" href="/brands">
          Explore Brands →
        </Link>
      </ContentSection>
      <ContentSection title="Latest News">
        <div className="three-grid">
          {[1, 2, 3].map((n) => (
            <SimpleCard
              key={n}
              title={`News placeholder 0${n}`}
              text="Company news will appear here when approved articles are available."
              href="/news"
            />
          ))}
        </div>
      </ContentSection>
      <section className="career-band">
        <div className="container split">
          <div>
            <h2>Join Our Team</h2>
            <p>Explore future opportunities at Khouanchay Trading.</p>
          </div>
          <Link className="button button-dark" href="/careers">
            Explore Careers
          </Link>
        </div>
      </section>
    </main>
  );
}
