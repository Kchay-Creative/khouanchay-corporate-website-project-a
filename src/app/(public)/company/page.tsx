import {
  ContentSection,
  PageHero,
  Placeholder,
} from "@/components/public/sections";
export default function CompanyPage() {
  return (
    <main>
      <PageHero title="Company" description="Get to know Khouanchay Trading." />
      <ContentSection title="Company Overview">
        <Placeholder
          title="Overview"
          detail="Official company introduction will be provided later."
        />
      </ContentSection>
      <ContentSection title="Our Story" className="section-tint">
        <Placeholder
          title="History"
          detail="Company history and milestones await approved content."
        />
      </ContentSection>
      <ContentSection title="Vision & Mission">
        <div className="two-grid">
          <Placeholder
            title="Vision"
            detail="Official vision statement pending."
          />
          <Placeholder
            title="Mission"
            detail="Official mission statement pending."
          />
        </div>
      </ContentSection>
      <ContentSection title="Core Values" className="section-tint">
        <Placeholder title="Values" detail="Company values pending." />
      </ContentSection>
      <ContentSection title="Company Timeline">
        <Placeholder
          title="Milestones"
          detail="Verified milestone dates and details pending."
        />
      </ContentSection>
      <ContentSection title="Leadership" className="section-tint">
        <Placeholder
          title="Leadership"
          detail="Approved leadership profiles pending."
        />
      </ContentSection>
      <ContentSection title="Organization">
        <Placeholder
          title="Organization Structure"
          detail="Approved organization information pending."
        />
      </ContentSection>
    </main>
  );
}
