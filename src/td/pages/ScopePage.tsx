import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { ScopeCreateSheet, ScopeDetailSheet } from "../components/ScopeSheets";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { formatDateShort } from "../../utils/date";
import type { ScopeBlock } from "../types";

export function ScopePage() {
  const { scopeBlocks, itemsForScope } = useTodo();
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<ScopeBlock | null>(null);

  const sorted = [...scopeBlocks].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  return (
    <div className="page">
      <header className="program-header">
        <h1>scope</h1>
      </header>
      <p className="hint">
        tasks that span a few days, so they don't get lost inside one day's list.
      </p>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>no scope blocks yet</p>
        </div>
      ) : (
        <div className="program-exercise-list">
          {sorted.map((block) => {
            const items = itemsForScope(block.id);
            return (
              <button className="scope-row" key={block.id} onClick={() => setViewing(block)}>
                <div className="scope-row-main">
                  <span className="scope-row-label">{block.label}</span>
                  <span className="scope-row-range">
                    {formatDateShort(block.startDate)} – {formatDateShort(block.endDate)}
                  </span>
                </div>
                {items.length > 0 && (
                  <span className="template-block-tally">
                    {items.filter((i) => i.completed).length}/{items.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button className="add-exercise-btn" onClick={() => setCreating(true)}>
        + new scope
      </button>

      <ArtworkPanel seed="td-scope" />

      {creating && <ScopeCreateSheet onClose={() => setCreating(false)} />}
      {viewing && <ScopeDetailSheet block={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
