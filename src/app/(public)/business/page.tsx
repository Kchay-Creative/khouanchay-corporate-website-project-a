import Link from "next/link";
import {
  ContentSection,
  PageHero,
  Placeholder,
  SimpleCard,
} from "@/components/public/sections";
export default function BusinessPage() {
  return (
    <main>
      <PageHero
        title="Our Business"
        description="The company’s business areas will be described here after the structure is confirmed."
      />
      <ContentSection title="Business Areas">
        <div className="three-grid">
          {[1, 2, 3].map((n) => (
            <SimpleCard
              key={n}
              title={`Business area 0${n}`}
              text="Category and details to be confirmed."
            />
          ))}
        </div>
      </ContentSection>
      <ContentSection title="Business Details" className="section-tint">
        <Placeholder
          title="Operations"
          detail="Products, services, and operations will be added from approved source material."
        />
      </ContentSection>
      <section className="simple-cta">
        <div className="container split">
          <div>
            <h2>Get in touch</h2>
            <p>Contact our team for company information.</p>
          </div>
          <Link className="button button-primary" href="/contact">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
