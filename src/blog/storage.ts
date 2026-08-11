import type { Article, ArticleSegment, BlogState, RedactionSession } from "./types";

const STORAGE_KEY = "lift-log-blog-v1";

const DEFAULT_STATE: BlogState = {
  articles: [],
  activeSessionId: null,
};

// Drop anything malformed rather than let a bad/partial localStorage blob
// crash the reader — same defensiveness as betterd/storage.ts's nested
// per-language sanitizing.
function sanitizeSegment(s: unknown): ArticleSegment | null {
  const seg = s as Record<string, unknown>;
  if (!seg || typeof seg.id !== "string") return null;
  if (seg.type === "text" && typeof seg.text === "string") {
    return { id: seg.id, type: "text", text: seg.text };
  }
  if (
    seg.type === "redacted" &&
    typeof seg.approxLength === "number" &&
    typeof seg.sessionId === "string" &&
    (seg.redactedAt === null || typeof seg.redactedAt === "string")
  ) {
    return {
      id: seg.id,
      type: "redacted",
      redactedAt: seg.redactedAt as string | null,
      approxLength: seg.approxLength,
      pendingText: typeof seg.pendingText === "string" ? seg.pendingText : undefined,
      sessionId: seg.sessionId,
    };
  }
  return null;
}

function sanitizeSession(s: unknown): RedactionSession | null {
  const sess = s as Record<string, unknown>;
  if (!sess || typeof sess.id !== "string") return null;
  return {
    id: sess.id,
    weekIndex: typeof sess.weekIndex === "number" ? sess.weekIndex : -1,
    startedAt: typeof sess.startedAt === "number" ? sess.startedAt : Date.now(),
    closedAt: typeof sess.closedAt === "string" ? sess.closedAt : null,
  };
}

function sanitizeArticle(a: unknown): Article | null {
  const art = a as Record<string, unknown>;
  if (!art || typeof art.id !== "string" || typeof art.title !== "string") return null;
  return {
    id: art.id,
    title: art.title,
    status: art.status === "published" ? "published" : "draft",
    segments: Array.isArray(art.segments)
      ? art.segments.map(sanitizeSegment).filter((s): s is ArticleSegment => !!s)
      : [],
    redactionSessions: Array.isArray(art.redactionSessions)
      ? art.redactionSessions.map(sanitizeSession).filter((s): s is RedactionSession => !!s)
      : [],
    createdAt: typeof art.createdAt === "number" ? art.createdAt : Date.now(),
    publishedAt: typeof art.publishedAt === "string" ? art.publishedAt : null,
    artSeed: typeof art.artSeed === "string" ? art.artSeed : art.id,
  };
}

export function loadBlogState(): BlogState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<BlogState>;
    return {
      articles: Array.isArray(parsed.articles)
        ? parsed.articles.map(sanitizeArticle).filter((a): a is Article => !!a)
        : [],
      activeSessionId: typeof parsed.activeSessionId === "string" ? parsed.activeSessionId : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveBlogState(state: BlogState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
