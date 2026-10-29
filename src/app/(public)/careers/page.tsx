import {
  ContentSection,
  PageHero,
  Placeholder,
} from "@/components/public/sections";
import { getI18n, pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("careers");
}
export default async function CareersPage() {
  const { dictionary: d } = await getI18n();
  const c = d.careers;
  return (
    <main>
      <PageHero title={c.title} description={c.intro} />
      <ContentSection title={c.lifeTitle}>
        <Placeholder title={c.people} detail={c.peopleBody} />
      </ContentSection>
      <ContentSection title={c.whyTitle} className="section-tint">
        <Placeholder title={c.benefits} detail={c.benefitsBody} />
      </ContentSection>
      <ContentSection title={c.positionsTitle}>
        <div className="empty-state">
          <h3>{c.noPositions}</h3>
          <p>{c.positionsBody}</p>
        </div>
      </ContentSection>
      <ContentSection title={c.joinTitle} className="section-tint">
        <p>{c.joinBody}</p>
      </ContentSection>
    </main>
  );
}
