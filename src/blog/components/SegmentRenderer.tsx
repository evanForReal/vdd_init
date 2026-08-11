import type { ArticleSegment } from "../types";
import { RedactedBar } from "./RedactedBar";

export function SegmentRenderer({
  segments,
  selectable = false,
}: {
  segments: ArticleSegment[];
  selectable?: boolean;
}) {
  return (
    <p className="article-body">
      {segments.map((seg) =>
        seg.type === "text" ? (
          <span
            key={seg.id}
            data-segment-id={seg.id}
            className={`article-text-segment ${selectable ? "selectable" : ""}`}
          >
            {seg.text}
          </span>
        ) : (
          <RedactedBar key={seg.id} segment={seg} />
        )
      )}
    </p>
  );
}
