import {
  ContentSection,
  PageHero,
  Placeholder,
} from "@/components/public/sections";
import { formatMessage } from "@/i18n";
import { getI18n, pageMetadata } from "@/i18n/server";
export async function generateMetadata() {
  return pageMetadata("news");
}
export default async function NewsPage() {
  const { dictionary: d } = await getI18n();
  const c = d.news;
  return (
    <main>
      <PageHero title={c.title} description={c.intro} />
      <ContentSection title={c.featuredTitle}>
        <Placeholder title={c.featuredArticle} detail={c.featuredBody} />
      </ContentSection>
      <ContentSection title={c.latestTitle} className="section-tint">
        <div className="three-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <article className="news-placeholder" key={n}>
              <div className="news-image">{c.imagePending}</div>
              <div className="news-content">
                <span>{c.articlePlaceholder}</span>
                <h3>
                  {formatMessage(c.item, {
                    number: String(n).padStart(2, "0"),
                  })}
                </h3>
                <p>{c.itemBody}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="section-note">{c.note}</p>
      </ContentSection>
    </main>
  );
}
