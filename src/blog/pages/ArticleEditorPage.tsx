import { useBlog } from "../context/BlogContext";

export function ArticleEditorPage({
  articleId,
  onPublished,
  onBack,
}: {
  articleId: string;
  onPublished: () => void;
  onBack: () => void;
}) {
  const { getArticle, updateDraftText, publishArticle } = useBlog();
  const article = getArticle(articleId);

  if (!article) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>gone</h2>
          <p>this draft no longer exists.</p>
        </div>
      </div>
    );
  }

  const text = article.segments[0]?.type === "text" ? article.segments[0].text : "";

  function handlePublish() {
    if (
      confirm(
        "publish this? the 8-week redaction schedule starts today, and once a weekly pass is closed out, whatever's cut in it is gone for good."
      )
    ) {
      publishArticle(articleId);
      onPublished();
    }
  }

  return (
    <div className="page blog-editor-page">
      <h1 className="blog-editor-title">{article.title}</h1>
      <textarea
        className="text-field textarea-field blog-editor-textarea"
        placeholder="start writing…"
        value={text}
        onChange={(e) => updateDraftText(articleId, e.target.value)}
        autoFocus
      />
      <div className="blog-editor-actions">
        <button className="text-btn" onClick={onBack}>
          save for later
        </button>
        <button className="primary-btn" disabled={!text.trim()} onClick={handlePublish}>
          publish
        </button>
      </div>
    </div>
  );
}
