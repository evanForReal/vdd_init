import { daysBetween, todayISO } from "../utils/date";
import type { Article } from "./types";

export const CHECKPOINT_INTERVAL_DAYS = 7;
export const TOTAL_WEEKS = 8;
export const AGE_GRADIENT_DAYS = TOTAL_WEEKS * CHECKPOINT_INTERVAL_DAYS; // 56

export interface RedactionStatusInfo {
  dueNow: boolean;
  weeksElapsed: number; // clamped 0..8
  currentWeekIndex: number | null; // 0-7, or null if no checkpoint has arrived yet
}

// Derived live from `publishedAt` on every call — never stored/cached, same
// precedent as betterd's effectiveStreak(). A draft (no publishedAt) is
// never due. Once week 8's checkpoint is satisfied, weeksElapsed stays
// clamped at 8 forever and dueNow stays false forever — reminders stop
// permanently, with no further bookkeeping needed.
export function redactionStatus(article: Article, today: string = todayISO()): RedactionStatusInfo {
  if (article.status !== "published" || !article.publishedAt) {
    return { dueNow: false, weeksElapsed: 0, currentWeekIndex: null };
  }
  const daysSince = Math.max(0, daysBetween(article.publishedAt, today));
  const weeksElapsed = Math.min(TOTAL_WEEKS, Math.floor(daysSince / CHECKPOINT_INTERVAL_DAYS));
  const currentWeekIndex = weeksElapsed > 0 ? weeksElapsed - 1 : null;

  const hasClosedSessionForWeek =
    currentWeekIndex !== null &&
    article.redactionSessions.some((s) => s.weekIndex === currentWeekIndex && s.closedAt !== null);

  return {
    dueNow: currentWeekIndex !== null && !hasClosedSessionForWeek,
    weeksElapsed,
    currentWeekIndex,
  };
}

export function dueArticles(articles: Article[], today: string = todayISO()): Article[] {
  return articles.filter((a) => redactionStatus(a, today).dueNow);
}

// Fresh (day 0) -> light stonewash translucent blue. Aged (day 56+) -> near-
// black. Linear rgba interpolation over the 0-56 day window, clamped past
// that. Keep numerically in sync with the --redact-fresh/--redact-aged CSS
// vars if either is retuned.
const FRESH = { r: 138, g: 168, b: 196, a: 0.55 };
const AGED = { r: 10, g: 10, b: 12, a: 0.97 };

export const FRESH_REDACTION_COLOR = `rgba(${FRESH.r}, ${FRESH.g}, ${FRESH.b}, ${FRESH.a})`;

export function redactionBarColor(redactedAtISO: string, today: string = todayISO()): string {
  const ageDays = Math.max(0, daysBetween(redactedAtISO, today));
  const t = Math.min(1, ageDays / AGE_GRADIENT_DAYS);
  const r = Math.round(FRESH.r + (AGED.r - FRESH.r) * t);
  const g = Math.round(FRESH.g + (AGED.g - FRESH.g) * t);
  const b = Math.round(FRESH.b + (AGED.b - FRESH.b) * t);
  const a = FRESH.a + (AGED.a - FRESH.a) * t;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export { randomId };
