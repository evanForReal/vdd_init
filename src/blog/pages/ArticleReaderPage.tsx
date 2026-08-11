import { useBlog } from "../context/BlogContext";
import { SegmentRenderer } from "../components/SegmentRenderer";
import { ArtworkPanel } from "../../components/ArtworkPanel";

export function ArticleReaderPage({
  articleId,
  onRedact,
}: {
  articleId: string;
  onRedact: () => void;
}) {
  const { getArticle, statusFor } = useBlog();
  const article = getArticle(articleId);

  if (!article) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>gone</h2>
        </div>
      </div>
    );
  }

  const status = statusFor(articleId);

  return (
    <div className="page blog-reader-page">
      <h1 className="blog-hand-title">{article.title}</h1>
      <div className="blog-reader-meta">
        published {article.publishedAt} · week {status.weeksElapsed} of 8
      </div>

      <ArtworkPanel seed={article.artSeed} variant="raw" categories={["abstract", "landscape"]} />

      <SegmentRenderer segments={article.segments} />

      {status.dueNow ? (
        <button className="primary-btn blog-redact-cta" onClick={onRedact}>
          redact this week&rsquo;s passage
        </button>
      ) : status.weeksElapsed < 8 ? (
        <div className="blog-reader-note">next redaction pass arrives weekly — check back soon.</div>
      ) : (
        <button className="text-btn blog-redact-cta" onClick={onRedact}>
          redact more (ad hoc, no more scheduled reminders)
        </button>
      )}
    </div>
  );
}
