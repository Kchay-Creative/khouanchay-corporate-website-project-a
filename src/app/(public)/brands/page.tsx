import { ContentSection, PageHero } from "@/components/public/sections";
export default function BrandsPage() {
  return (
    <main>
      <PageHero
        title="Brands & Partners"
        description="A directory for company brands, distributed brands, and partners."
      />
      <ContentSection title="Brand Directory">
        <div className="three-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div className="brand-placeholder" key={n}>
              <div className="brand-mark" aria-hidden="true">
                —
              </div>
              <h3>Brand placeholder {String(n).padStart(2, "0")}</h3>
              <p>Approved brand information pending.</p>
            </div>
          ))}
        </div>
      </ContentSection>
    </main>
  );
}
