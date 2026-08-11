import { useBlog } from "../context/BlogContext";
import { PlusIcon } from "../../nutrition/components/Icons";

export function ArticleListPage({
  onOpenArticle,
  onNewArticle,
}: {
  onOpenArticle: (articleId: string) => void;
  onNewArticle: () => void;
}) {
  const { articles, statusFor } = useBlog();
  const sorted = [...articles].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="page blog-list-page">
      <div className="blog-list-header">
        <h1 className="blog-page-title">articles</h1>
        <button className="icon-btn blog-new-btn" onClick={onNewArticle} aria-label="new article">
          <PlusIcon />
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <h2>a blank page</h2>
          <p>nothing written yet. start something.</p>
        </div>
      ) : (
        <div className="blog-article-list">
          {sorted.map((a) => {
            const status = statusFor(a.id);
            return (
              <button key={a.id} className="blog-article-card" onClick={() => onOpenArticle(a.id)}>
                <span className="blog-article-title">{a.title}</span>
                <span className="blog-article-meta">
                  {a.status === "draft" ? "draft" : `published · week ${status.weeksElapsed}/8`}
                  {status.dueNow && <span className="blog-due-dot" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
