import {
  ContentSection,
  PageHero,
  Placeholder,
} from "@/components/public/sections";
export default function NewsPage() {
  return (
    <main>
      <PageHero
        title="News & Activities"
        description="Company updates, events, activities, and announcements."
      />
      <ContentSection title="Featured News">
        <Placeholder
          title="Featured article"
          detail="An approved featured article will appear here."
        />
      </ContentSection>
      <ContentSection title="Latest Updates" className="section-tint">
        <div className="three-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <article className="news-placeholder" key={n}>
              <div className="news-image">Image pending</div>
              <div className="news-content">
                <span>Article placeholder</span>
                <h3>News item {String(n).padStart(2, "0")}</h3>
                <p>Publication date, category, and article copy pending.</p>
              </div>
            </article>
          ))}
        </div>
        <p className="section-note">
          Article pages and pagination will be connected when news content is
          available.
        </p>
      </ContentSection>
    </main>
  );
}
