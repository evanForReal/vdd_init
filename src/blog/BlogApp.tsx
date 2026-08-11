import { useState } from "react";
import { BlogProvider, useBlog } from "./context/BlogContext";
import { ArticleListPage } from "./pages/ArticleListPage";
import { ArticleEditorPage } from "./pages/ArticleEditorPage";
import { ArticleReaderPage } from "./pages/ArticleReaderPage";
import { RedactionSessionPage } from "./pages/RedactionSessionPage";
import { BlogMenu } from "./components/BlogMenu";

type View =
  | { kind: "list" }
  | { kind: "editor"; articleId: string }
  | { kind: "reader"; articleId: string }
  | { kind: "session"; articleId: string };

function BlogShell({ onBack }: { onBack: () => void }) {
  const { getArticle, createArticle, dueList, activeSessionArticle, startRedactionSession } = useBlog();
  const [view, setView] = useState<View>({ kind: "list" });

  function openArticle(articleId: string) {
    const article = getArticle(articleId);
    if (!article) return;
    setView(article.status === "draft" ? { kind: "editor", articleId } : { kind: "reader", articleId });
  }

  function newArticle() {
    const id = createArticle("untitled");
    setView({ kind: "editor", articleId: id });
  }

  // Only one redaction session can be open app-wide. If one's already open
  // (on this article or another), resume it rather than silently no-op'ing
  // — there is never a case where a second session actually starts.
  function redact(articleId: string) {
    if (activeSessionArticle) {
      setView({ kind: "session", articleId: activeSessionArticle.id });
      return;
    }
    startRedactionSession(articleId);
    setView({ kind: "session", articleId });
  }

  return (
    <div className="app-shell blog-shell">
      {view.kind !== "session" && (
        <button className="back-btn" onClick={view.kind === "list" ? onBack : () => setView({ kind: "list" })}>
          ‹ {view.kind === "list" ? "home" : "articles"}
        </button>
      )}
      {view.kind === "list" && (
        <BlogMenu dueList={dueList} onRedact={redact} />
      )}
      <main className="app-main">
        {view.kind === "list" && (
          <ArticleListPage onOpenArticle={openArticle} onNewArticle={newArticle} />
        )}
        {view.kind === "editor" && (
          <ArticleEditorPage
            articleId={view.articleId}
            onPublished={() => setView({ kind: "reader", articleId: view.articleId })}
            onBack={() => setView({ kind: "list" })}
          />
        )}
        {view.kind === "reader" && (
          <ArticleReaderPage
            articleId={view.articleId}
            onRedact={() => redact(view.articleId)}
          />
        )}
        {view.kind === "session" && (
          <RedactionSessionPage
            articleId={view.articleId}
            onDone={() => setView({ kind: "reader", articleId: view.articleId })}
          />
        )}
      </main>
    </div>
  );
}

export function BlogApp({ onBack }: { onBack: () => void }) {
  return (
    <BlogProvider>
      <BlogShell onBack={onBack} />
    </BlogProvider>
  );
}
