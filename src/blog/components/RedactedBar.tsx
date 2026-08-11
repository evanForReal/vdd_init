import type { ArticleSegment } from "../types";
import { FRESH_REDACTION_COLOR, redactionBarColor } from "../utils";

type RedactedSegment = Extract<ArticleSegment, { type: "redacted" }>;

const NBSP = "\u00A0";

// A run of nothing but plain spaces only offers the browser a wrap point at
// its very end, not throughout — so a long one just overflows instead of
// wrapping. Non-breaking-space "words" separated by ordinary breakable
// spaces give real wrap points every few characters, the way real prose
// has one at every word boundary — while the span's background still
// paints continuously underneath all of it (nbsp or not), so it still
// reads as one smooth mark, not separate word-chunks.
function fillerContent(approxLength: number): string {
  const total = Math.max(3, Math.min(300, approxLength));
  const chunkSize = 5;
  const chunks: string[] = [];
  for (let i = 0; i < total; i += chunkSize) {
    chunks.push(NBSP.repeat(Math.min(chunkSize, total - i)));
  }
  return chunks.join(" ");
}

export function RedactedBar({ segment }: { segment: RedactedSegment }) {
  const color = segment.redactedAt ? redactionBarColor(segment.redactedAt) : FRESH_REDACTION_COLOR;
  return (
    <span className="redacted-bar" style={{ background: color }} aria-label="redacted passage">
      {fillerContent(segment.approxLength)}
    </span>
  );
}
