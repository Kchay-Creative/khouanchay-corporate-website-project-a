import {
  ContentSection,
  PageHero,
  Placeholder,
} from "@/components/public/sections";
export default function CareersPage() {
  return (
    <main>
      <PageHero
        title="Careers"
        description="Discover opportunities and learn about working at Khouanchay Trading."
      />
      <ContentSection title="Life at Khouanchay">
        <Placeholder
          title="Our People"
          detail="Culture stories and approved images pending."
        />
      </ContentSection>
      <ContentSection title="Why Work With Us" className="section-tint">
        <Placeholder
          title="Benefits & Culture"
          detail="Verified benefits and employee information pending."
        />
      </ContentSection>
      <ContentSection title="Open Positions">
        <div className="empty-state">
          <h3>No positions published yet</h3>
          <p>Approved job openings will appear here when available.</p>
        </div>
      </ContentSection>
      <ContentSection title="Join Our Team" className="section-tint">
        <p>
          Recruitment and application information will be added in a later
          phase.
        </p>
      </ContentSection>
    </main>
  );
}
