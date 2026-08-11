import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Article, ArticleSegment, BlogState, RedactionSession } from "../types";
import { loadBlogState, saveBlogState } from "../storage";
import { dueArticles, randomId, redactionStatus, type RedactionStatusInfo } from "../utils";
import { todayISO } from "../../utils/date";

function mergeAdjacentTextSegments(segments: ArticleSegment[]): ArticleSegment[] {
  const out: ArticleSegment[] = [];
  for (const seg of segments) {
    const prev = out[out.length - 1];
    if (prev && prev.type === "text" && seg.type === "text") {
      out[out.length - 1] = { ...prev, text: prev.text + seg.text };
    } else {
      out.push(seg);
    }
  }
  return out;
}

function findActiveContext(
  articles: Article[],
  activeSessionId: string | null
): { article: Article; session: RedactionSession } | null {
  if (!activeSessionId) return null;
  for (const article of articles) {
    const session = article.redactionSessions.find((s) => s.id === activeSessionId);
    if (session) return { article, session };
  }
  return null;
}

interface BlogContextValue {
  articles: Article[];
  getArticle: (id: string) => Article | undefined;

  createArticle: (title: string) => string;
  updateDraftText: (articleId: string, text: string) => void;
  publishArticle: (articleId: string) => void;

  dueList: Article[];
  statusFor: (articleId: string) => RedactionStatusInfo;

  activeSession: RedactionSession | null;
  activeSessionArticle: Article | null;
  startRedactionSession: (articleId: string) => void;
  redactSpan: (segmentId: string, startOffset: number, endOffset: number) => void;
  undoRedaction: (segmentId: string) => void;
  endRedactionSession: () => void;
}

const BlogContext = createContext<BlogContextValue | null>(null);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BlogState>(() => loadBlogState());

  useEffect(() => {
    saveBlogState(state);
  }, [state]);

  function getArticle(id: string): Article | undefined {
    return state.articles.find((a) => a.id === id);
  }

  function createArticle(title: string): string {
    const id = randomId();
    const article: Article = {
      id,
      title: title.trim() || "untitled",
      status: "draft",
      segments: [{ id: randomId(), type: "text", text: "" }],
      redactionSessions: [],
      createdAt: Date.now(),
      publishedAt: null,
      artSeed: id,
    };
    setState((s) => ({ ...s, articles: [...s.articles, article] }));
    return id;
  }

  function updateDraftText(articleId: string, text: string) {
    setState((s) => ({
      ...s,
      articles: s.articles.map((a) => {
        if (a.id !== articleId || a.status !== "draft") return a;
        const seg = a.segments[0];
        if (!seg || seg.type !== "text") return a;
        return { ...a, segments: [{ ...seg, text }] };
      }),
    }));
  }

  function publishArticle(articleId: string) {
    setState((s) => ({
      ...s,
      articles: s.articles.map((a) =>
        a.id === articleId && a.status === "draft"
          ? { ...a, status: "published", publishedAt: todayISO() }
          : a
      ),
    }));
  }

  function statusFor(articleId: string): RedactionStatusInfo {
    const article = getArticle(articleId);
    return article ? redactionStatus(article) : { dueNow: false, weeksElapsed: 0, currentWeekIndex: null };
  }

  function startRedactionSession(articleId: string) {
    setState((s) => {
      if (s.activeSessionId) return s; // only one session open at a time, app-wide
      const article = s.articles.find((a) => a.id === articleId);
      if (!article) return s;
      const status = redactionStatus(article);
      const session: RedactionSession = {
        id: randomId(),
        weekIndex: status.currentWeekIndex ?? -1,
        startedAt: Date.now(),
        closedAt: null,
      };
      return {
        ...s,
        activeSessionId: session.id,
        articles: s.articles.map((a) =>
          a.id === articleId ? { ...a, redactionSessions: [...a.redactionSessions, session] } : a
        ),
      };
    });
  }

  function redactSpan(segmentId: string, startOffset: number, endOffset: number) {
    setState((s) => {
      if (!s.activeSessionId) return s;
      const sessionId = s.activeSessionId;
      return {
        ...s,
        articles: s.articles.map((a) => {
          const idx = a.segments.findIndex((seg) => seg.id === segmentId);
          if (idx === -1) return a;
          const seg = a.segments[idx];
          if (seg.type !== "text") return a;
          const text = seg.text;
          const start = Math.max(0, Math.min(startOffset, text.length));
          const end = Math.max(start, Math.min(endOffset, text.length));
          if (start === end) return a;
          const before = text.slice(0, start);
          const cut = text.slice(start, end);
          const after = text.slice(end);
          const replacement: ArticleSegment[] = [];
          if (before) replacement.push({ id: randomId(), type: "text", text: before });
          replacement.push({
            id: randomId(),
            type: "redacted",
            redactedAt: null,
            approxLength: cut.length,
            pendingText: cut,
            sessionId,
          });
          if (after) replacement.push({ id: randomId(), type: "text", text: after });
          return {
            ...a,
            segments: [...a.segments.slice(0, idx), ...replacement, ...a.segments.slice(idx + 1)],
          };
        }),
      };
    });
  }

  function undoRedaction(segmentId: string) {
    setState((s) => {
      if (!s.activeSessionId) return s;
      return {
        ...s,
        articles: s.articles.map((a) => {
          const idx = a.segments.findIndex((seg) => seg.id === segmentId);
          if (idx === -1) return a;
          const seg = a.segments[idx];
          if (seg.type !== "redacted" || seg.redactedAt !== null || seg.sessionId !== s.activeSessionId) {
            return a;
          }
          const restored: ArticleSegment = { id: randomId(), type: "text", text: seg.pendingText ?? "" };
          const segments = mergeAdjacentTextSegments([
            ...a.segments.slice(0, idx),
            restored,
            ...a.segments.slice(idx + 1),
          ]);
          return { ...a, segments };
        }),
      };
    });
  }

  function endRedactionSession() {
    setState((s) => {
      if (!s.activeSessionId) return s;
      const sessionId = s.activeSessionId;
      const today = todayISO();
      return {
        ...s,
        activeSessionId: null,
        articles: s.articles.map((a) => {
          const hasSession = a.redactionSessions.some((sess) => sess.id === sessionId);
          if (!hasSession) return a;
          return {
            ...a,
            redactionSessions: a.redactionSessions.map((sess) =>
              sess.id === sessionId ? { ...sess, closedAt: today } : sess
            ),
            segments: a.segments.map((seg) =>
              seg.type === "redacted" && seg.sessionId === sessionId && seg.redactedAt === null
                ? { ...seg, redactedAt: today, pendingText: undefined }
                : seg
            ),
          };
        }),
      };
    });
  }

  const activeContext = findActiveContext(state.articles, state.activeSessionId);

  return (
    <BlogContext.Provider
      value={{
        articles: state.articles,
        getArticle,
        createArticle,
        updateDraftText,
        publishArticle,
        dueList: dueArticles(state.articles),
        statusFor,
        activeSession: activeContext?.session ?? null,
        activeSessionArticle: activeContext?.article ?? null,
        startRedactionSession,
        redactSpan,
        undoRedaction,
        endRedactionSession,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog(): BlogContextValue {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within BlogProvider");
  return ctx;
}
