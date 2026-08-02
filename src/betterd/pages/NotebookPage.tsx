import { useBetterD } from "../context/BetterDContext";
import { modulesForLanguage } from "../content";
import type { LanguageCode } from "../types";
import { formatDateLong } from "../../utils/date";

export function NotebookPage({
  language,
  moduleId,
  onBack,
}: {
  language: LanguageCode;
  moduleId: string;
  onBack: () => void;
}) {
  const { notesForModule } = useBetterD();
  const module = modulesForLanguage(language).find((m) => m.id === moduleId);
  const notes = notesForModule(moduleId);

  return (
    <div className="page">
      <header className="today-header">
        <button className="text-btn" onClick={onBack}>
          ‹ back
        </button>
        <div className="today-date">notebook</div>
        <div className="meso-name">{module?.title ?? moduleId}</div>
      </header>

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>nothing jotted down yet — use the note button during a lesson.</p>
        </div>
      ) : (
        <div className="notebook-doc">
          {notes.map((note) => (
            <div className="notebook-entry" key={note.id}>
              <div className="notebook-entry-date">{formatDateLong(new Date(note.createdAt).toISOString().slice(0, 10))}</div>
              <p className="notebook-entry-text">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
