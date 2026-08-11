import type { ArticleSegment } from "../types";
import { FRESH_REDACTION_COLOR, redactionBarColor } from "../utils";

type RedactedSegment = Extract<ArticleSegment, { type: "redacted" }>;

// Rendered as a run of solid block glyphs (not a CSS-width box) so it
// participates in normal inline text flow and wraps like real prose would
// — a long redacted passage breaks across lines instead of overflowing the
// viewport as one giant fixed-width bar.
export function RedactedBar({ segment }: { segment: RedactedSegment }) {
  const color = segment.redactedAt ? redactionBarColor(segment.redactedAt) : FRESH_REDACTION_COLOR;
  const glyphCount = Math.max(3, Math.min(220, segment.approxLength));
  return (
    <span className="redacted-bar" style={{ color }} aria-label="redacted passage">
      {"█".repeat(glyphCount)}
    </span>
  );
}
