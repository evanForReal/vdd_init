export type ArticleStatus = "draft" | "published";

// Ordered content. A segment is either live text, or a redaction bar.
// `redactedAt: null` means still inside its open session — pendingText is
// present and fully undoable. Once the session closes, redactedAt is
// stamped and pendingText is deleted — at that point the original text is
// gone from the data model entirely, not just hidden.
export type ArticleSegment =
  | { id: string; type: "text"; text: string }
  | {
      id: string;
      type: "redacted";
      redactedAt: string | null; // ISO date once finalized; null while pending
      approxLength: number; // original char count, for bar sizing only — survives finalize
      pendingText?: string; // ONLY present while redactedAt is null
      sessionId: string; // which session produced it (scopes undo to "still the open session")
    };

// One weekly check-in. Recorded even with zero redactions — "read it,
// nothing to cut this week" is a legitimate, expected outcome, and this
// record is what actually satisfies that week's checkpoint (see utils.ts).
export interface RedactionSession {
  id: string;
  weekIndex: number; // 0-7 for a scheduled checkpoint, -1 for an ad hoc pass after week 8
  startedAt: number; // epoch ms
  closedAt: string | null; // ISO date; null while open
}

export interface Article {
  id: string;
  title: string;
  status: ArticleStatus;
  segments: ArticleSegment[];
  redactionSessions: RedactionSession[];
  createdAt: number; // epoch ms
  publishedAt: string | null; // ISO date; reference point for the 8-week schedule
  artSeed: string; // stable seed for ArtworkPanel, fixed at creation
}

export interface BlogState {
  articles: Article[];
  activeSessionId: string | null; // at most one open session at a time, app-wide
}
