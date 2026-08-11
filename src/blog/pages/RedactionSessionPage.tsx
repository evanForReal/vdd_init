import { useRef, useState } from "react";
import { useBlog } from "../context/BlogContext";
import { SegmentRenderer } from "../components/SegmentRenderer";
import type { ArticleSegment } from "../types";

interface PendingSelection {
  segmentId: string;
  start: number;
  end: number;
}

// v1 constraint: a redaction must stay within a single text segment — if
// the selection spans two segments (crosses an earlier redaction bar, or
// the rare multi-segment case), this just returns null and no "redact"
// button appears, rather than guessing at a cross-segment cut.
function getSelectionInfo(container: HTMLElement): PendingSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  const toElement = (node: Node): Element | null =>
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
  const startEl = toElement(range.startContainer)?.closest("[data-segment-id]");
  const endEl = toElement(range.endContainer)?.closest("[data-segment-id]");
  if (!startEl || !endEl || startEl !== endEl) return null;

  const segmentId = startEl.getAttribute("data-segment-id");
  if (!segmentId) return null;
  return { segmentId, start: range.startOffset, end: range.endOffset };
}

export function RedactionSessionPage({
  articleId,
  onDone,
}: {
  articleId: string;
  onDone: () => void;
}) {
  const { getArticle, redactSpan, undoRedaction, endRedactionSession, activeSession } = useBlog();
  const article = getArticle(articleId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);

  if (!article) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>gone</h2>
        </div>
      </div>
    );
  }

  function handlePointerUp() {
    if (!containerRef.current) {
      setPending(null);
      return;
    }
    setPending(getSelectionInfo(containerRef.current));
  }

  function confirmRedact() {
    if (!pending) return;
    redactSpan(pending.segmentId, pending.start, pending.end);
    window.getSelection()?.removeAllRanges();
    setPending(null);
  }

  function cancelSelection() {
    window.getSelection()?.removeAllRanges();
    setPending(null);
  }

  function finishSession() {
    if (confirm("end this session? anything cut just now is gone for good — there's no undo after this.")) {
      window.getSelection()?.removeAllRanges();
      endRedactionSession();
      onDone();
    }
  }

  const pendingSegments = article.segments.filter(
    (s): s is Extract<ArticleSegment, { type: "redacted" }> =>
      s.type === "redacted" && s.redactedAt === null && s.sessionId === activeSession?.id
  );

  const weekLabel =
    activeSession && activeSession.weekIndex >= 0
      ? `week ${activeSession.weekIndex + 1} of 8`
      : "ad hoc pass";

  return (
    <div className="page blog-session-page">
      <div className="blog-session-header">
        <h1 className="blog-hand-title">{article.title}</h1>
        <span className="blog-session-week">{weekLabel}</span>
      </div>
      <p className="blog-session-hint">select a passage, then mark it for redaction.</p>

      <div className="article-body-wrap" ref={containerRef} onPointerUp={handlePointerUp}>
        <SegmentRenderer segments={article.segments} selectable />
      </div>

      {pending && (
        <div className="blog-select-bar">
          <button className="text-btn" onClick={cancelSelection}>
            cancel
          </button>
          <button className="primary-btn" onClick={confirmRedact}>
            redact selection
          </button>
        </div>
      )}

      {pendingSegments.length > 0 && (
        <div className="blog-pending-list">
          <div className="field-label">cut this session — undo before you close</div>
          {pendingSegments.map((s) => (
            <button key={s.id} className="blog-pending-item" onClick={() => undoRedaction(s.id)}>
              undo a cut ({s.approxLength} chars)
            </button>
          ))}
        </div>
      )}

      <div className="blog-session-actions">
        <button className="primary-btn" onClick={finishSession}>
          end session
        </button>
      </div>
    </div>
  );
}
