import { useState } from "react";
import { BookIcon, CaptionsIcon, MenuIcon } from "../../nutrition/components/Icons";

export function LessonMenu({
  entryCount,
  onAppendNote,
  showNotes,
  showTransliteration,
  onToggleTransliteration,
}: {
  entryCount: number;
  onAppendNote: (text: string) => void;
  showNotes: boolean;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [notePanelOpen, setNotePanelOpen] = useState(false);
  const [value, setValue] = useState("");

  function close() {
    setOpen(false);
    setNotePanelOpen(false);
  }

  function commitNote() {
    if (!value.trim()) return;
    onAppendNote(value.trim());
    setValue("");
  }

  return (
    <div className="lesson-menu">
      <button
        className="icon-btn lesson-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Lesson menu"
      >
        <MenuIcon />
      </button>
      {open && (
        <>
          <div className="lesson-menu-scrim" onClick={close} />
          <div className="lesson-menu-panel">
            {showNotes && (
              <>
                <button className="lesson-menu-item" onClick={() => setNotePanelOpen((o) => !o)}>
                  <BookIcon className="lesson-menu-icon" />
                  <span>note{entryCount > 0 ? ` (${entryCount})` : ""}</span>
                </button>
                {notePanelOpen && (
                  <div className="lesson-menu-note-panel">
                    <textarea
                      className="text-field textarea-field"
                      rows={3}
                      placeholder="jot something down about this lesson…"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                    <button className="primary-btn" onClick={commitNote} disabled={!value.trim()}>
                      add to note
                    </button>
                  </div>
                )}
              </>
            )}
            <button className="lesson-menu-item" onClick={onToggleTransliteration}>
              <CaptionsIcon className="lesson-menu-icon" />
              <span>transliteration</span>
              <span className={`lesson-menu-toggle ${showTransliteration ? "on" : ""}`} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
